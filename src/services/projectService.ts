import axios from 'axios';

// --- Interfaces ---
// Based on backend User model (excluding password)
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'specialist' | 'startup_representative' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

// Based on backend Project model
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  ownerId: string;
  owner?: User; // Included if fetched with owner details
  members?: ProjectMemberInfo[]; // Included if fetched with members
  tasks?: Task[]; // Included if fetched with tasks
  createdAt?: string;
  updatedAt?: string;
}
export interface ProjectCreationData extends Omit<Project, 'id' | 'ownerId' | 'owner' | 'createdAt' | 'updatedAt' | 'members' | 'tasks'> {
  // title, description, status are required or optional based on backend
}
export interface ProjectUpdateData extends Partial<ProjectCreationData> {}


// Based on backend ProjectMember model (and how it's returned)
export interface ProjectMemberInfo extends User { // User details
  roleInProject: string; // From the ProjectMember join table
}

// Based on backend Task model
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  assignee?: User; // Included if fetched with assignee details
  createdAt?: string;
  updatedAt?: string;
}
export interface TaskCreationData extends Omit<Task, 'id' | 'projectId' | 'assignee' | 'createdAt' | 'updatedAt'> {
    // title, description, status, etc.
}
export interface TaskUpdateData extends Partial<TaskCreationData> {}

// For paginated responses
export interface PaginatedResponse<T> {
  totalPages: number;
  currentPage: number;
  totalItems: number; // Assuming backend sends this, e.g., totalProjects or totalTasks
  items: T[];
}

const API_BASE_URL = '/api'; // Assuming your API is prefixed with /api

// --- Helper for Error Handling ---
const handleError = (error: any, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data;
    if (serverError && serverError.message) {
      throw new Error(serverError.message);
    }
    throw new Error(error.message || defaultMessage);
  }
  throw new Error(defaultMessage);
};

// --- Project CRUD ---
export const projectService = {
  createProject: async (projectData: ProjectCreationData): Promise<Project> => {
    try {
      const response = await axios.post<Project>(`${API_BASE_URL}/projects`, projectData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create project.');
      return null as never; // Should not reach here due to throw in handleError
    }
  },

  getProjects: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Project>> => {
    try {
      // Backend returns: { totalPages, currentPage, totalProjects, projects }
      // We need to map 'totalProjects' to 'totalItems' and 'projects' to 'items'
      const response = await axios.get<{ totalPages: number; currentPage: number; totalProjects: number; projects: Project[] }>(
        `${API_BASE_URL}/projects`, 
        { params }
      );
      return {
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalItems: response.data.totalProjects,
        items: response.data.projects,
      };
    } catch (error) {
      handleError(error, 'Failed to fetch projects.');
      return null as never;
    }
  },

  getProjectById: async (projectId: string): Promise<Project> => {
    try {
      const response = await axios.get<Project>(`${API_BASE_URL}/projects/${projectId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch project details.');
      return null as never;
    }
  },

  updateProject: async (projectId: string, projectData: ProjectUpdateData): Promise<Project> => {
    try {
      const response = await axios.put<Project>(`${API_BASE_URL}/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to update project.');
      return null as never;
    }
  },

  deleteProject: async (projectId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
    } catch (error) {
      handleError(error, 'Failed to delete project.');
    }
  },

  // --- Project Member Management ---
  addProjectMember: async (projectId: string, userId: string, roleInProject: string): Promise<{ message: string; member: any }> => { // Backend returns { message, member }
    try {
      const response = await axios.post<{ message: string; member: any }>(
        `${API_BASE_URL}/projects/${projectId}/members`,
        { userId, roleInProject }
      );
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to add project member.');
      return null as never;
    }
  },

  removeProjectMember: async (projectId: string, memberUserId: string): Promise<{ message: string }> => { // Backend returns { message }
    try {
      const response = await axios.delete<{ message: string }>(`${API_BASE_URL}/projects/${projectId}/members/${memberUserId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to remove project member.');
      return null as never;
    }
  },

  getProjectMembers: async (projectId: string): Promise<ProjectMemberInfo[]> => {
    try {
      const response = await axios.get<ProjectMemberInfo[]>(`${API_BASE_URL}/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch project members.');
      return null as never;
    }
  },

  // --- Task CRUD (within a project) ---
  createTask: async (projectId: string, taskData: TaskCreationData): Promise<Task> => {
    try {
      const response = await axios.post<Task>(`${API_BASE_URL}/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create task.');
      return null as never;
    }
  },

  getTasksForProject: async (projectId: string, filters?: { status?: string; assigneeId?: string }): Promise<Task[]> => {
    try {
      const response = await axios.get<Task[]>(`${API_BASE_URL}/projects/${projectId}/tasks`, { params: filters });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch tasks for project.');
      return null as never;
    }
  },

  getTaskById: async (projectId: string, taskId: string): Promise<Task> => {
    try {
      const response = await axios.get<Task>(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch task details.');
      return null as never;
    }
  },

  updateTask: async (projectId: string, taskId: string, taskData: TaskUpdateData): Promise<Task> => {
    try {
      const response = await axios.put<Task>(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to update task.');
      return null as never;
    }
  },

  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`);
    } catch (error) {
      handleError(error, 'Failed to delete task.');
    }
  },
};

export default projectService;
