import express, { Request, Response, Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { Project, User, ProjectMember, Task } from '../models/index.js'; // Assuming models are exported from index
import { Op } from 'sequelize'; // For potential future search/filter operations

const router = Router();

// --- Protect all routes ---
router.use(protect);

// POST /api/projects - Create a new project
router.post('/', async (req: Request, res: Response) => {
  const { title, description, status } = req.body;
  const ownerId = req.user?.id;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  if (!ownerId) {
    return res.status(400).json({ message: 'User ID not found. Cannot create project without an owner.' });
  }
  
  // Optional: Validate status if provided
  const allowedStatus = ['planning', 'active', 'completed', 'on_hold'];
  if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatus.join(', ')}.` });
  }

  try {
    const project = await Project.create({
      title,
      description,
      status: status || 'planning', // Default to 'planning' if not provided
      ownerId,
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Project creation error:', error);
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const messages = (error as any).errors.map((e: any) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error during project creation.' });
  }
});

// GET /api/projects - Get a list of projects
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // TODO: Consider filtering projects by user association (owned or member) in the future.
  // For now, listing all projects.

  try {
    const { count, rows } = await Project.findAndCountAll({
      limit,
      offset,
      include: [{ model: User, as: 'owner', attributes: ['id', 'username', 'email'] }], // Include owner details
      order: [['createdAt', 'DESC']],
    });

    res.json({
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProjects: count,
      projects: rows,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
});

// GET /api/projects/:projectId - Get a single project by its ID
router.get('/:projectId', async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username', 'email'] },
        // TODO: Include members and tasks in the future
        // { model: User, as: 'members', through: { attributes: ['roleInProject'] }, attributes: ['id', 'username', 'email'] },
        // { model: Task, as: 'tasks' }
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.json(project);
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while fetching the project.' });
  }
});

// PUT /api/projects/:projectId - Update an existing project
router.put('/:projectId', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user?.id;

  // Basic input validation
  if (!title && !description && !status) {
    return res.status(400).json({ message: 'No fields to update. Provide title, description, or status.' });
  }
  
  const allowedStatus = ['planning', 'active', 'completed', 'on_hold'];
  if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatus.join(', ')}.` });
  }

  try {
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authorization: Only project owner or an admin can update
    // For now, only owner check. Admin role check can be added with authorize middleware.
    // e.g. router.put('/:projectId', authorize('admin'), async (req: Request, res: Response) => { ... }
    // or check req.user.role === 'admin'
    if (project.ownerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project.' });
    }

    // Update fields if provided
    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status as 'planning' | 'active' | 'completed' | 'on_hold';

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
     if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const messages = (error as any).errors.map((e: any) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error while updating the project.' });
  }
});

// DELETE /api/projects/:projectId - Delete a project
router.delete('/:projectId', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  try {
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authorization: Only project owner or an admin can delete
    if (project.ownerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project.' });
    }

    await project.destroy();
    res.status(204).send(); // Or res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while deleting the project.' });
  }
});


// --- Project Member Routes ---

// POST /api/projects/:projectId/members - Add a user to a project
router.post('/:projectId/members', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { userId: memberUserId, roleInProject } = req.body; // memberUserId is the ID of the user to be added
  const authenticatedUserId = req.user?.id;

  if (!memberUserId || !roleInProject) {
    return res.status(400).json({ message: 'User ID and role in project are required.' });
  }

  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authorization: Only project owner or admin can add members
    if (project.ownerId !== authenticatedUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add members to this project.' });
    }

    const userToAdd = await User.findByPk(memberUserId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User to be added not found.' });
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      where: {
        projectId: project.id,
        userId: userToAdd.id, // Sequelize will create 'userId' and 'projectId' foreign keys in ProjectMember
      },
    });

    if (existingMember) {
      return res.status(409).json({ message: 'User is already a member of this project.' });
    }

    // Create the association in ProjectMember table
    // 'addMember' is a Sequelize auto-generated method for many-to-many associations
    // await project.addMember(userToAdd, { through: { roleInProject } });

    // Or create ProjectMember record directly if more control is needed or 'addMember' is not working as expected
     const newMember = await ProjectMember.create({
       projectId: project.id,
       userId: userToAdd.id,
       roleInProject: roleInProject,
     });

    res.status(201).json({ message: 'User added to project successfully.', member: newMember });
  } catch (error) {
    console.error(`Error adding member to project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while adding member to project.' });
  }
});

// DELETE /api/projects/:projectId/members/:memberUserId - Remove a user from a project
router.delete('/:projectId/members/:memberUserId', async (req: Request, res: Response) => {
  const { projectId, memberUserId } = req.params;
  const authenticatedUserId = req.user?.id;

  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authorization: Only project owner or admin can remove members
    if (project.ownerId !== authenticatedUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove members from this project.' });
    }

    const userToRemove = await User.findByPk(memberUserId);
    if (!userToRemove) {
      return res.status(404).json({ message: 'User to be removed not found.' });
    }

    // Remove the association from ProjectMember table
    // 'removeMember' is a Sequelize auto-generated method
    // const result = await project.removeMember(userToRemove);

    // Or delete ProjectMember record directly
    const result = await ProjectMember.destroy({
        where: {
            projectId: project.id,
            userId: userToRemove.id,
        }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'User is not a member of this project or already removed.' });
    }

    res.status(200).json({ message: 'User removed from project successfully.' }); // Or 204 No Content
  } catch (error) {
    console.error(`Error removing member ${memberUserId} from project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while removing member from project.' });
  }
});

// GET /api/projects/:projectId/members - List members of a project
router.get('/:projectId/members', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const authenticatedUserId = req.user?.id;

  try {
    const project = await Project.findByPk(projectId, {
      // Check if authenticated user is a member or owner for authorization to view members
      include: [{
        model: User,
        as: 'members',
        attributes: [], // Don't need all member details here, just for the check
        through: { attributes: [] }
      }]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    // Authorization: Owner, admin, or any member of the project can view the member list.
    // The 'members' alias is from Project.belongsToMany(User, { through: ProjectMember, as: 'members'})
    const isOwner = project.ownerId === authenticatedUserId;
    const isAdmin = req.user?.role === 'admin';
    // Check if the authenticated user is part of the project's members
    // Need to fetch members separately to check if current user is among them
    const membersForAuthCheck = await project.getMembers({ attributes: ['id'] }); // 'getMembers' is auto-generated
    const isMember = membersForAuthCheck.some(member => member.id === authenticatedUserId);


    if (!isOwner && !isAdmin && !isMember) {
        return res.status(403).json({ message: 'Not authorized to view members of this project.' });
    }

    // Fetch members again with desired attributes
    const members = await project.getMembers({
        attributes: ['id', 'username', 'email', 'role'], // User attributes
        joinTableAttributes: ['roleInProject'] // Attributes from the ProjectMember (through) table
    });
    
    // The result from getMembers with joinTableAttributes is a bit nested.
    // Each user object will have a `ProjectMember` property containing `roleInProject`.
    // We can re-map this for a cleaner API response.
    const formattedMembers = members.map(member => {
        const memberJson = member.toJSON() as any; // Type assertion
        return {
            id: memberJson.id,
            username: memberJson.username,
            email: memberJson.email,
            role: memberJson.role, // User's general role in the system
            roleInProject: memberJson.ProjectMember?.roleInProject // Role specific to this project
        };
    });


    res.json(formattedMembers);
  } catch (error) {
    console.error(`Error fetching members for project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while fetching project members.' });
  }
});


// --- Task Routes for a Project ---

// Middleware to check if the authenticated user is a member of the project
const checkProjectMembership = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    req.project = project; // Attach project to request for later use

    const isOwner = project.ownerId === authenticatedUserId;
    const isAdmin = req.user?.role === 'admin';
    
    let isMember = false;
    if (!isOwner && !isAdmin) { // Only check ProjectMember table if not owner or admin (they have implicit access)
        const member = await ProjectMember.findOne({
          where: { projectId: projectId, userId: authenticatedUserId },
        });
        isMember = !!member;
    }

    if (isOwner || isAdmin || isMember) {
      return next();
    } else {
      return res.status(403).json({ message: 'Not authorized to access tasks for this project. User is not a member, owner, or admin.' });
    }
  } catch (error) {
    console.error('Error checking project membership:', error);
    return res.status(500).json({ message: 'Server error during project membership check.' });
  }
};


// POST /api/projects/:projectId/tasks - Create a new task for a project
router.post('/:projectId/tasks', checkProjectMembership, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, status, assigneeId, dueDate } = req.body;
  const creatorId = req.user?.id; // Authenticated user creating the task

  if (!title) {
    return res.status(400).json({ message: 'Task title is required.' });
  }
  
  const allowedStatus = ['todo', 'in_progress', 'done', 'blocked'];
  if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatus.join(', ')}.` });
  }

  try {
    // If assigneeId is provided, verify the assignee is a member of the project
    if (assigneeId) {
      const assigneeUser = await User.findByPk(assigneeId);
      if (!assigneeUser) {
        return res.status(404).json({ message: `Assignee user with ID ${assigneeId} not found.`});
      }
      const isAssigneeMember = await ProjectMember.findOne({
        where: { projectId: projectId, userId: assigneeId },
      });
      const projectOwner = req.project?.ownerId; // req.project is attached by checkProjectMembership
      // Allow assignment if the assignee is a project member OR the project owner
      if (!isAssigneeMember && assigneeId !== projectOwner) {
        return res.status(403).json({ message: `Assignee with ID ${assigneeId} is not a member or owner of this project.` });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      dueDate: dueDate || null,
      projectId,
      assigneeId: assigneeId || null, // Creator is not automatically assignee unless specified
    });

    // Optionally, fetch the task with assignee details to return
    const taskWithDetails = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'assignee', attributes: ['id', 'username', 'email']}]
    });

    res.status(201).json(taskWithDetails);
  } catch (error) {
    console.error(`Error creating task for project ${projectId}:`, error);
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const messages = (error as any).errors.map((e: any) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error while creating task.' });
  }
});

// GET /api/projects/:projectId/tasks - Get all tasks for a specific project
router.get('/:projectId/tasks', checkProjectMembership, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { status: queryStatus, assigneeId: queryAssigneeId } = req.query;

  const whereClause: any = { projectId };
  if (queryStatus) {
      whereClause.status = queryStatus;
  }
  if (queryAssigneeId) {
      whereClause.assigneeId = queryAssigneeId;
  }

  try {
    const tasks = await Task.findAll({
      where: whereClause,
      include: [{ model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
});

// GET /api/projects/:projectId/tasks/:taskId - Get a single task
router.get('/:projectId/tasks/:taskId', checkProjectMembership, async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;

  try {
    const task = await Task.findOne({
      where: { id: taskId, projectId: projectId },
      include: [{ model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project.' });
    }
    res.json(task);
  } catch (error) {
    console.error(`Error fetching task ${taskId} for project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while fetching task.' });
  }
});

// PUT /api/projects/:projectId/tasks/:taskId - Update an existing task
router.put('/:projectId/tasks/:taskId', checkProjectMembership, async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const { title, description, status, assigneeId, dueDate } = req.body;
  const authenticatedUserId = req.user?.id;

  if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No fields to update. Provide title, description, status, assigneeId, or dueDate.' });
  }
  
  const allowedStatus = ['todo', 'in_progress', 'done', 'blocked'];
  if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatus.join(', ')}.` });
  }

  try {
    const task = await Task.findOne({
      where: { id: taskId, projectId: projectId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project.' });
    }

    // Authorization: For now, any project member can update task details.
    // More granular control (e.g., only assignee or project lead) can be added here.
    // Example: if (task.assigneeId !== authenticatedUserId && req.project.ownerId !== authenticatedUserId && req.user.role !== 'admin') { ... }

    if (assigneeId) {
      const assigneeUser = await User.findByPk(assigneeId);
      if (!assigneeUser) {
        return res.status(404).json({ message: `Assignee user with ID ${assigneeId} not found.`});
      }
      const isAssigneeMember = await ProjectMember.findOne({
        where: { projectId: projectId, userId: assigneeId },
      });
       const projectOwner = req.project?.ownerId;
      if (!isAssigneeMember && assigneeId !== projectOwner) {
        return res.status(403).json({ message: `New assignee with ID ${assigneeId} is not a member or owner of this project.` });
      }
      task.assigneeId = assigneeId;
    } else if (assigneeId === null) { // Allow unassigning
        task.assigneeId = null;
    }


    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status as 'todo' | 'in_progress' | 'done' | 'blocked';
    if (dueDate !== undefined) task.dueDate = dueDate; // Allow setting to null to remove due date

    await task.save();
    
    const updatedTaskWithDetails = await Task.findByPk(task.id, {
        include: [{ model: User, as: 'assignee', attributes: ['id', 'username', 'email']}]
    });

    res.json(updatedTaskWithDetails);
  } catch (error) {
    console.error(`Error updating task ${taskId} for project ${projectId}:`, error);
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const messages = (error as any).errors.map((e: any) => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error while updating task.' });
  }
});

// DELETE /api/projects/:projectId/tasks/:taskId - Delete a task
router.delete('/:projectId/tasks/:taskId', checkProjectMembership, async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const authenticatedUserId = req.user?.id;

  try {
    const task = await Task.findOne({
      where: { id: taskId, projectId: projectId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project.' });
    }

    // Authorization: For now, any project member can delete a task.
    // More granular control (e.g., only project owner/lead or task creator) can be added here.
    // Example: if (req.project.ownerId !== authenticatedUserId && req.user.role !== 'admin') { ... }

    await task.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting task ${taskId} for project ${projectId}:`, error);
    res.status(500).json({ message: 'Server error while deleting task.' });
  }
});


// Extend Express Request type to include 'project' for the middleware
declare global {
  namespace Express {
    interface Request {
      project?: InstanceType<typeof Project>;
    }
  }
}

export default router;
