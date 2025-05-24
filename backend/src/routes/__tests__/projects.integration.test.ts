import request from 'supertest';
import express, { Express } from 'express';
import { Sequelize } from 'sequelize';
import db from '../../models/index.js'; // Imports User, Project, etc. & sequelize instance
import { User, UserCreationAttributes, Project, Task, ProjectMember } from '../../models/index.js'; // For type usage
import authRoutes from '../authRoutes.js';
import projectRoutes from '../projectRoutes.js'; // The router we are testing

let app: Express;
let sequelize: Sequelize;

// --- Test Users ---
const ownerUserData: UserCreationAttributes = { username: 'projectowner', email: 'owner@example.com', password: 'password123', role: 'startup_representative' };
const memberUserData: UserCreationAttributes = { username: 'projectmember', email: 'member@example.com', password: 'password123', role: 'specialist' };
const nonMemberUserData: UserCreationAttributes = { username: 'nonmember', email: 'nonmember@example.com', password: 'password123', role: 'specialist' };
const adminUserData: UserCreationAttributes = { username: 'adminuser', email: 'admin@example.com', password: 'password123', role: 'admin' };


// --- Helper Functions ---
let ownerToken: string;
let memberToken: string;
let nonMemberToken: string;
let adminToken: string;

let createdOwnerUser: User;
let createdMemberUser: User;
let createdNonMemberUser: User;
let createdAdminUser: User;

const registerAndLoginUser = async (userData: UserCreationAttributes): Promise<{ user: User, token: string }> => {
    // Register user directly via model to avoid duplicate registration issues if test order changes
    // const existingUser = await User.findOne({ where: { email: userData.email }});
    // if(existingUser) await existingUser.destroy(); // ensure clean slate for this specific helper if run multiple times with same data

    const user = await User.create(userData);
    
    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
    if (loginResponse.status !== 200) {
        console.error('Login failed in helper:', loginResponse.body);
        throw new Error(`Failed to log in ${userData.username}. Status: ${loginResponse.status}`);
    }
    return { user, token: loginResponse.body.token };
};

const createProjectAPI = async (token: string, projectData: { title: string, description: string, status?: string }): Promise<Project> => {
    const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);
    if (response.status !== 201) {
        console.error('Project creation failed in helper:', response.body);
        throw new Error(`Failed to create project. Status: ${response.status}`);
    }
    return response.body as Project;
};


// --- Test Suite Setup ---
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes); // Auth routes needed for login helper
  app.use('/api/projects', projectRoutes); // Project routes being tested
  
  sequelize = db.sequelizeInstance;
  await sequelize.sync({ force: true });

  // Create and login users to get tokens
  const owner = await registerAndLoginUser(ownerUserData);
  createdOwnerUser = owner.user;
  ownerToken = owner.token;

  const member = await registerAndLoginUser(memberUserData);
  createdMemberUser = member.user;
  memberToken = member.token;
  
  const nonMember = await registerAndLoginUser(nonMemberUserData);
  createdNonMemberUser = nonMember.user;
  nonMemberToken = nonMember.token;

  const admin = await registerAndLoginUser(adminUserData);
  createdAdminUser = admin.user;
  adminToken = admin.token;

});

beforeEach(async () => {
  // Clean up projects, tasks, project members before each test. Users are cleaned globally or per suite.
  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await ProjectMember.destroy({ where: {}, truncate: true, cascade: true });
  await Project.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
  // Clean up users after all tests in the suite
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await sequelize.close();
});


// --- Tests ---

describe('Project CRUD (/api/projects)', () => {
  const projectData = { title: 'Test Project 1', description: 'A description for test project 1', status: 'planning' as const };

  describe('POST /api/projects', () => {
    it('should create a project successfully by an authenticated user (owner)', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(projectData);
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(projectData.title);
      expect(response.body.ownerId).toBe(createdOwnerUser.id);
    });

    it('should return 400 for missing title', async () => {
      const { title, ...invalidData } = projectData;
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Title and description are required');
    });
    
    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({...projectData, status: 'invalid_status'});
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid status');
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send(projectData);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    it('should retrieve a list of projects (paginated) by authenticated user', async () => {
      await createProjectAPI(ownerToken, projectData);
      const response = await request(app)
        .get('/api/projects?page=1&limit=5')
        .set('Authorization', `Bearer ${memberToken}`); // Any authenticated user can list
      expect(response.status).toBe(200);
      expect(response.body.projects).toBeInstanceOf(Array);
      expect(response.body.projects.length).toBeGreaterThanOrEqual(1);
      expect(response.body.totalPages).toBeDefined();
      expect(response.body.currentPage).toBe(1);
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app).get('/api/projects');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects/:projectId', () => {
    let testProject: Project;
    beforeEach(async () => {
        testProject = await createProjectAPI(ownerToken, projectData);
    });

    it('should retrieve a specific project by authenticated user', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject.id}`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testProject.id);
      expect(response.body.title).toBe(testProject.title);
    });

    it('should return 404 for a non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/nonexistent-uuid-project-id')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(response.status).toBe(404);
    });
    
    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app).get(`/api/projects/${testProject.id}`);
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/projects/:projectId', () => {
    let testProject: Project;
    const updateData = { title: 'Updated Project Title', status: 'active' as const };
    beforeEach(async () => {
        testProject = await createProjectAPI(ownerToken, projectData);
    });

    it('should update project successfully by owner', async () => {
        const response = await request(app)
            .put(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send(updateData);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updateData.title);
        expect(response.body.status).toBe(updateData.status);
    });
    
    it('should update project successfully by admin', async () => {
        const response = await request(app)
            .put(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updateData.title);
    });

    it('should return 403 for update by non-owner/non-admin', async () => {
        const response = await request(app)
            .put(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${memberToken}`) // member is not owner or admin
            .send(updateData);
        expect(response.status).toBe(403);
    });
    
    it('should return 401 for unauthenticated user', async () => {
        const response = await request(app)
            .put(`/api/projects/${testProject.id}`)
            .send(updateData);
        expect(response.status).toBe(401);
    });

    it('should return 404 for updating non-existent project', async () => {
        const response = await request(app)
            .put('/api/projects/nonexistent-uuid-project-id')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send(updateData);
        expect(response.status).toBe(404);
    });
    
    it('should return 400 for invalid status update', async () => {
      const response = await request(app)
            .put(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ status: 'invalid_status_value' });
        expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/projects/:projectId', () => {
    let testProject: Project;
    beforeEach(async () => {
        testProject = await createProjectAPI(ownerToken, projectData);
    });

    it('should delete project successfully by owner', async () => {
        const response = await request(app)
            .delete(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(response.status).toBe(204);
    });
    
    it('should delete project successfully by admin', async () => {
        const response = await request(app)
            .delete(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(204);
    });

    it('should return 403 for deletion by non-owner/non-admin', async () => {
        const response = await request(app)
            .delete(`/api/projects/${testProject.id}`)
            .set('Authorization', `Bearer ${memberToken}`);
        expect(response.status).toBe(403);
    });

    it('should return 401 for unauthenticated user', async () => {
        const response = await request(app)
            .delete(`/api/projects/${testProject.id}`);
        expect(response.status).toBe(401);
    });
    
    it('should return 404 for deleting non-existent project', async () => {
        const response = await request(app)
            .delete('/api/projects/nonexistent-uuid-project-id')
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(response.status).toBe(404);
    });
  });
});


describe('Project Member Management (/api/projects/:projectId/members)', () => {
    let projectOwnedByOwner: Project;
    const memberRole = 'Developer';

    beforeEach(async () => {
        projectOwnedByOwner = await createProjectAPI(ownerToken, { title: 'Member Management Project', description: 'Desc' });
    });

    describe('POST /:projectId/members', () => {
        it('should allow project owner to add a member', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ userId: createdMemberUser.id, roleInProject: memberRole });
            expect(response.status).toBe(201);
            expect(response.body.member.userId).toBe(createdMemberUser.id);
            expect(response.body.member.projectId).toBe(projectOwnedByOwner.id);
            expect(response.body.member.roleInProject).toBe(memberRole);
        });
        
        it('should allow admin to add a member', async () => {
             const response = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: createdNonMemberUser.id, roleInProject: "Tester" });
            expect(response.status).toBe(201);
            expect(response.body.member.userId).toBe(createdNonMemberUser.id);
        });

        it('should return 403 if non-owner/non-admin tries to add member', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${nonMemberToken}`)
                .send({ userId: createdMemberUser.id, roleInProject: memberRole });
            expect(response.status).toBe(403);
        });

        it('should return 404 if adding a non-existent user', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ userId: 'nonexistent-user-id', roleInProject: memberRole });
            expect(response.status).toBe(404); // User to be added not found
        });
        
        it('should return 400 for missing userId or roleInProject', async () => {
            let res = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ roleInProject: memberRole });
            expect(res.status).toBe(400);
            
            res = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ userId: createdMemberUser.id });
            expect(res.status).toBe(400);
        });

        it('should return 409 if adding an existing member', async () => {
            await projectService.addProjectMember(projectOwnedByOwner.id, createdMemberUser.id, memberRole); // Add member first
            const response = await request(app)
                .post(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ userId: createdMemberUser.id, roleInProject: memberRole });
            expect(response.status).toBe(409);
        });
    });

    describe('GET /:projectId/members', () => {
        beforeEach(async () => {
            // Owner is implicitly a member for access, add another member
            await projectService.addProjectMember(projectOwnedByOwner.id, createdMemberUser.id, memberRole);
        });

        it('should allow project owner to retrieve member list', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${ownerToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            // Owner is not explicitly added via ProjectMember, so list might be 1 if only 'createdMemberUser' is added.
            // The backend logic might include the owner implicitly or not. Based on current impl, it fetches ProjectMember records.
            expect(response.body.length).toBeGreaterThanOrEqual(1); 
            expect(response.body.some((m:any) => m.id === createdMemberUser.id)).toBe(true);
        });
        
        it('should allow project member to retrieve member list', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${memberToken}`); // memberToken is for createdMemberUser
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
        });
        
        it('should allow admin to retrieve member list', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should return 403 if non-member/non-owner/non-admin tries to retrieve list', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectOwnedByOwner.id}/members`)
                .set('Authorization', `Bearer ${nonMemberToken}`);
            expect(response.status).toBe(403);
        });
    });
    
    describe('DELETE /:projectId/members/:memberUserId', () => {
        beforeEach(async () => {
            await projectService.addProjectMember(projectOwnedByOwner.id, createdMemberUser.id, memberRole);
        });

        it('should allow project owner to remove a member', async () => {
            const response = await request(app)
                .delete(`/api/projects/${projectOwnedByOwner.id}/members/${createdMemberUser.id}`)
                .set('Authorization', `Bearer ${ownerToken}`);
            expect(response.status).toBe(200); // Or 204
        });
        
        it('should allow admin to remove a member', async () => {
            const response = await request(app)
                .delete(`/api/projects/${projectOwnedByOwner.id}/members/${createdMemberUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });

        it('should return 403 if non-owner/non-admin tries to remove member', async () => {
            const response = await request(app)
                .delete(`/api/projects/${projectOwnedByOwner.id}/members/${createdMemberUser.id}`)
                .set('Authorization', `Bearer ${nonMemberToken}`);
            expect(response.status).toBe(403);
        });
        
        it('should return 404 if trying to remove a non-member or non-existent user', async () => {
            const response = await request(app)
                .delete(`/api/projects/${projectOwnedByOwner.id}/members/${createdNonMemberUser.id}`) // nonMemberUser was not added
                .set('Authorization', `Bearer ${ownerToken}`);
            expect(response.status).toBe(404);
        });
    });
});


describe('Task Management (/api/projects/:projectId/tasks)', () => {
    let projectForTasks: Project;
    let taskData = { title: 'Task 1', description: 'Description for task 1', status: 'todo' as const };

    beforeAll(async () => {
        // Ensure owner and member are part of the project for task tests
        projectForTasks = await createProjectAPI(ownerToken, { title: 'Project For Tasks', description: '...' });
        // Add 'createdMemberUser' as a member to 'projectForTasks' for testing member access
        await ProjectMember.create({ projectId: projectForTasks.id, userId: createdMemberUser.id, roleInProject: 'TaskWorker' });
    });
    
    // Task to be used in GET (single), PUT, DELETE
    let createdTestTask: Task;

    describe('POST /:projectId/tasks', () => {
        it('should allow project member (owner) to create a task', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${ownerToken}`) // Owner is a member
                .send(taskData);
            expect(response.status).toBe(201);
            expect(response.body.title).toBe(taskData.title);
            expect(response.body.projectId).toBe(projectForTasks.id);
            createdTestTask = response.body; // Save for later tests
        });
        
        it('should allow project member (explicitly added) to create a task', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${memberToken}`) // memberToken is for createdMemberUser
                .send({ ...taskData, title: "Member's Task" });
            expect(response.status).toBe(201);
            expect(response.body.title).toBe("Member's Task");
        });

        it('should allow assigning to a valid project member (owner)', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ ...taskData, title: 'Task for Owner', assigneeId: createdOwnerUser.id });
            expect(response.status).toBe(201);
            expect(response.body.assigneeId).toBe(createdOwnerUser.id);
        });
        
        it('should allow assigning to a valid project member (explicitly added member)', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ ...taskData, title: 'Task for Member', assigneeId: createdMemberUser.id });
            expect(response.status).toBe(201);
            expect(response.body.assigneeId).toBe(createdMemberUser.id);
        });

        it('should return 403 if assigning to a non-project member', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ ...taskData, assigneeId: createdNonMemberUser.id });
            expect(response.status).toBe(403); // Backend returns 403 if assignee is not member or owner
        });

        it('should return 403 if non-project member tries to create a task', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${nonMemberToken}`)
                .send(taskData);
            expect(response.status).toBe(403);
        });
        
        it('should return 400 for missing task title', async () => {
            const {title, ...invalidTaskData} = taskData;
            const response = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(invalidTaskData);
            expect(response.status).toBe(400);
        });
    });

    describe('GET /:projectId/tasks', () => {
        beforeEach(async() => {
            // Ensure there's at least one task
            if(!createdTestTask || createdTestTask.projectId !== projectForTasks.id) {
                 const res = await request(app).post(`/api/projects/${projectForTasks.id}/tasks`).set('Authorization', `Bearer ${ownerToken}`).send(taskData);
                 createdTestTask = res.body;
            }
        });
        it('should allow project member to retrieve task list', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${memberToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
        });
        
        it('should filter tasks by status if filter is provided', async () => {
             await request(app).post(`/api/projects/${projectForTasks.id}/tasks`).set('Authorization', `Bearer ${ownerToken}`).send({...taskData, title: "In Progress Task", status: "in_progress"});
             const response = await request(app)
                .get(`/api/projects/${projectForTasks.id}/tasks?status=in_progress`)
                .set('Authorization', `Bearer ${ownerToken}`);
            expect(response.status).toBe(200);
            expect(response.body.every((task: Task) => task.status === 'in_progress')).toBe(true);
        });
    });

    describe('GET /:projectId/tasks/:taskId', () => {
         beforeEach(async() => {
            if(!createdTestTask || createdTestTask.projectId !== projectForTasks.id) {
                 const res = await request(app).post(`/api/projects/${projectForTasks.id}/tasks`).set('Authorization', `Bearer ${ownerToken}`).send(taskData);
                 createdTestTask = res.body;
            }
        });
        it('should allow project member to retrieve a specific task', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectForTasks.id}/tasks/${createdTestTask.id}`)
                .set('Authorization', `Bearer ${memberToken}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(createdTestTask.id);
        });
        
        it('should return 404 for non-existent task', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectForTasks.id}/tasks/non-existent-task-id`)
                .set('Authorization', `Bearer ${memberToken}`);
            expect(response.status).toBe(404);
        });
    });

    describe('PUT /:projectId/tasks/:taskId', () => {
        const updateTaskData = { title: 'Updated Task Title', status: 'in_progress' as const };
         beforeEach(async() => {
            if(!createdTestTask || createdTestTask.projectId !== projectForTasks.id) {
                 const res = await request(app).post(`/api/projects/${projectForTasks.id}/tasks`).set('Authorization', `Bearer ${ownerToken}`).send(taskData);
                 createdTestTask = res.body;
            }
        });

        it('should allow project member to update a task', async () => {
            const response = await request(app)
                .put(`/api/projects/${projectForTasks.id}/tasks/${createdTestTask.id}`)
                .set('Authorization', `Bearer ${memberToken}`) // Any project member can update
                .send(updateTaskData);
            expect(response.status).toBe(200);
            expect(response.body.title).toBe(updateTaskData.title);
            expect(response.body.status).toBe(updateTaskData.status);
        });
        
        it('should allow assigning task to another project member', async () => {
             const response = await request(app)
                .put(`/api/projects/${projectForTasks.id}/tasks/${createdTestTask.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ assigneeId: createdMemberUser.id });
            expect(response.status).toBe(200);
            expect(response.body.assigneeId).toBe(createdMemberUser.id);
        });
        
        it('should return 403 if trying to assign to non-project member', async () => {
             const response = await request(app)
                .put(`/api/projects/${projectForTasks.id}/tasks/${createdTestTask.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ assigneeId: createdNonMemberUser.id });
            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /:projectId/tasks/:taskId', () => {
         beforeEach(async() => { // Ensure task exists
            if(!createdTestTask || createdTestTask.projectId !== projectForTasks.id) {
                 const res = await request(app).post(`/api/projects/${projectForTasks.id}/tasks`).set('Authorization', `Bearer ${ownerToken}`).send(taskData);
                 createdTestTask = res.body;
            }
        });
        it('should allow project member to delete a task', async () => {
            // Create a task to delete for this specific test
            const taskToDeleteRes = await request(app)
                .post(`/api/projects/${projectForTasks.id}/tasks`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ ...taskData, title: "Task to be deleted" });
            const taskToDeleteId = taskToDeleteRes.body.id;

            const response = await request(app)
                .delete(`/api/projects/${projectForTasks.id}/tasks/${taskToDeleteId}`)
                .set('Authorization', `Bearer ${memberToken}`); // Any project member can delete
            expect(response.status).toBe(204);
        });
        
        it('should return 404 for deleting non-existent task', async () => {
             const response = await request(app)
                .delete(`/api/projects/${projectForTasks.id}/tasks/non-existent-task-for-delete`)
                .set('Authorization', `Bearer ${memberToken}`);
            expect(response.status).toBe(404);
        });
    });
});

// Helper service for direct DB manipulation if needed in tests, e.g. for setup.
// This is an example, actual usage might vary.
const projectService = {
  addProjectMember: async (projectId: string, userId: string, roleInProject: string) => {
    return await ProjectMember.create({ projectId, userId, roleInProject });
  },
  // Add other direct DB interactions if complex setup is needed that API helpers don't cover
};
