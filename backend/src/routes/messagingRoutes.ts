import express, { Request, Response, NextFunction, Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { User, Conversation, Message, ConversationParticipant } from '../models/index.js';
import { Sequelize, Op, Transaction } from 'sequelize';
import db from '../models/index.js'; // For transaction

const router = Router();

// --- Protect all routes ---
router.use(protect);

// --- Middleware to check if user is a participant of the conversation ---
const checkConversationParticipant = async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.params;
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const participantRecord = await ConversationParticipant.findOne({
      where: {
        conversationId: conversationId,
        userId: authenticatedUserId,
      },
    });

    if (!participantRecord) {
      return res.status(403).json({ message: 'Not authorized. You are not a participant in this conversation.' });
    }
    
    // Optionally attach conversation or participant record to req if needed later
    // req.conversationParticipant = participantRecord;

    next();
  } catch (error) {
    console.error('Error checking conversation participation:', error);
    return res.status(500).json({ message: 'Server error during conversation participation check.' });
  }
};


// --- Conversation Endpoints ---

// POST /api/conversations - Create a new conversation or find existing
router.post('/conversations', async (req: Request, res: Response) => {
  const { participantIds: requestedParticipantIds } = req.body as { participantIds: string[] };
  const authenticatedUserId = req.user!.id; // `protect` middleware ensures user is present

  if (!requestedParticipantIds || !Array.isArray(requestedParticipantIds) || requestedParticipantIds.length === 0) {
    return res.status(400).json({ message: 'Participant IDs array is required and must not be empty.' });
  }

  // Ensure authenticated user is part of the participants and all IDs are unique
  const allParticipantIds = Array.from(new Set([authenticatedUserId, ...requestedParticipantIds]));

  if (allParticipantIds.length < 2) {
      return res.status(400).json({ message: 'A conversation requires at least two unique participants.' });
  }

  // Verify all participant IDs exist as users
  try {
    const users = await User.findAll({ where: { id: { [Op.in]: allParticipantIds } } });
    if (users.length !== allParticipantIds.length) {
      const foundUserIds = users.map(u => u.id);
      const missingUserIds = allParticipantIds.filter(id => !foundUserIds.includes(id));
      return res.status(404).json({ message: `One or more participant users not found: ${missingUserIds.join(', ')}` });
    }
  } catch(error) {
    console.error('Error verifying users:', error);
    return res.status(500).json({ message: 'Error verifying participant users.' });
  }


  // Sort IDs to ensure consistent order for finding existing conversations
  const sortedParticipantIds = [...allParticipantIds].sort();

  const transaction = await db.sequelizeInstance.transaction();

  try {
    // Check if a conversation with this exact set of participants already exists
    // This is a complex query: find conversations that have *exactly* these participants.
    // One way: Find conversations with the same number of participants and all listed participants are in it.
    const existingConversations = await Conversation.findAll({
      attributes: ['id'],
      include: [{
        model: User,
        as: 'participants',
        attributes: ['id'],
        through: { attributes: [] }, // Don't need attributes from ConversationParticipant here
        where: { id: { [Op.in]: sortedParticipantIds } }
      }],
      group: ['Conversation.id'], // Group by Conversation.id
      having: Sequelize.literal(`COUNT(DISTINCT "participants"."id") = ${sortedParticipantIds.length}`),
      transaction
    });
    
    // Further filter to ensure no *other* participants are in these conversations
    let exactMatchConversation = null;
    for (const conv of existingConversations) {
        const participants = await conv.getParticipants({ attributes: ['id'], transaction });
        if (participants.length === sortedParticipantIds.length) {
            exactMatchConversation = conv;
            break;
        }
    }


    if (exactMatchConversation) {
      const fullConversation = await Conversation.findByPk(exactMatchConversation.id, {
        include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'email', 'role'] }],
        transaction,
      });
      await transaction.commit();
      return res.status(200).json(fullConversation);
    }

    // Create new conversation
    const newConversation = await Conversation.create({}, { transaction });

    // Add participants
    const participantEntries = sortedParticipantIds.map(userId => ({
      conversationId: newConversation.id,
      userId: userId,
    }));
    await ConversationParticipant.bulkCreate(participantEntries, { transaction });

    await transaction.commit();

    const fullNewConversation = await Conversation.findByPk(newConversation.id, {
      include: [{ model: User, as: 'participants', attributes: ['id', 'username', 'email', 'role'] }],
    });

    res.status(201).json(fullNewConversation);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating/finding conversation:', error);
    res.status(500).json({ message: 'Server error during conversation creation/retrieval.' });
  }
});

// GET /api/conversations - Get all conversations for the authenticated user
router.get('/conversations', async (req: Request, res: Response) => {
  const authenticatedUserId = req.user!.id;

  try {
    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'email', 'role'],
          through: { attributes: [] }, // Don't need attributes from ConversationParticipant itself in this part
          where: { id: authenticatedUserId }, // Filter by conversations where the user is a participant
        },
        // To get all participants of these conversations (not just the authenticated user)
        {
          model: User,
          as: 'participants', // Re-include participants without the where clause to get all of them
          attributes: ['id', 'username', 'email', 'role'],
          through: { attributes: [] },
          required: true, // Ensures we only get conversations that actually have participants
        },
        // TODO: Include last message (optional, can be complex)
        // {
        //   model: Message,
        //   as: 'messages', // Assuming 'messages' is the alias
        //   order: [['createdAt', 'DESC']],
        //   limit: 1,
        // }
      ],
      order: [['updatedAt', 'DESC']], // Order conversations by most recent activity
    });
    
    // The above query structure with two 'participants' includes might be tricky.
    // A more straightforward way:
    // 1. Find all conversation IDs the user is part of.
    // 2. Then fetch those conversations with all their participants and last message.

    const userConversationIds = await ConversationParticipant.findAll({
        where: { userId: authenticatedUserId },
        attributes: ['conversationId']
    });
    const conversationIds = userConversationIds.map(cp => cp.conversationId);

    const finalConversations = await Conversation.findAll({
        where: { id: { [Op.in]: conversationIds } },
        include: [
            {
                model: User,
                as: 'participants',
                attributes: ['id', 'username', 'email', 'role'],
                through: { attributes: [] }
            },
            // Example for last message (might need a subquery or a separate query for optimization)
            // This simple include will fetch ALL messages, not just the last one per conversation.
            // For a true "last message", a more complex query or logic is needed.
            // {
            //   model: Message,
            //   as: 'messages',
            //   limit: 1,
            //   order: [['createdAt', 'DESC']],
            //   include: [{ model: User, as: 'sender', attributes: ['id', 'username']}]
            // }
        ],
        order: [['updatedAt', 'DESC']]
    });


    res.json(finalConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error while fetching conversations.' });
  }
});


// --- Message Endpoints (nested under conversations) ---

// POST /api/conversations/:conversationId/messages - Send a new message
router.post('/conversations/:conversationId/messages', checkConversationParticipant, async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user!.id;

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ message: 'Message content is required and cannot be empty.' });
  }

  const transaction = await db.sequelizeInstance.transaction();
  try {
    const message = await Message.create({
      conversationId,
      senderId,
      content: content.trim(),
    }, { transaction });

    // Update conversation's updatedAt timestamp to reflect new message
    await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId }, transaction });
    
    // Optional: Update a lastMessageId on Conversation model if you have one.
    // await Conversation.update({ lastMessageId: message.id, updatedAt: new Date() }, { where: { id: conversationId }, transaction });

    await transaction.commit();

    // Fetch the message with sender details to return
    const fullMessage = await Message.findByPk(message.id, {
        include: [{model: User, as: 'sender', attributes: ['id', 'username', 'email']}]
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    await transaction.rollback();
    console.error(`Error sending message in conversation ${conversationId}:`, error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
});

// GET /api/conversations/:conversationId/messages - Get all messages for a conversation
router.get('/conversations/:conversationId/messages', checkConversationParticipant, async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20; // Default to 20 messages per page
  const offset = (page - 1) * limit;

  try {
    const { count, rows: messages } = await Message.findAndCountAll({
      where: { conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'ASC']], // Typically messages are shown oldest to newest
      limit,
      offset,
    });

    res.json({
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalMessages: count,
      messages,
    });
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    res.status(500).json({ message: 'Server error while fetching messages.' });
  }
});


export default router;
