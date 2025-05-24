import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    projectService, 
    Project, 
    ProjectUpdateData, 
    ProjectMemberInfo, 
    Task as ProjectTask, // Renamed to avoid conflict with React.Task
    TaskCreationData,
    TaskUpdateData
} from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';

// Helper components (can be moved to separate files later)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                &times;
            </button>
        </div>
        {children}
      </div>
    </div>
  );
};


const ProjectDetail: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Authenticated user

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For Edit Project Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<ProjectUpdateData>({});

  // For Members
  const [members, setMembers] = useState<ProjectMemberInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // For Tasks
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState<Partial<TaskCreationData>>({ title: '', description: '', status: 'todo' });
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editTaskData, setEditTaskData] = useState<Partial<TaskUpdateData>>({});
  const [taskStatusFilter, setTaskStatusFilter] = useState('');


  const fetchProjectDetails = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedProject = await projectService.getProjectById(projectId);
      setProject(fetchedProject);
      setEditFormData({ // Initialize edit form data
        title: fetchedProject.title,
        description: fetchedProject.description,
        status: fetchedProject.status,
      });
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Ошибка при загрузке проекта');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async () => {
    if (!projectId) return;
    setLoadingMembers(true);
    setMemberError(null);
    try {
      const fetchedMembers = await projectService.getProjectMembers(projectId);
      setMembers(fetchedMembers);
    } catch (err: any) {
      setMemberError(err.message || 'Не удалось загрузить участников');
    } finally {
      setLoadingMembers(false);
    }
  };
  
  const fetchProjectTasks = async () => {
    if (!projectId) return;
    setLoadingTasks(true);
    setTaskError(null);
    try {
      const fetchedTasks = await projectService.getTasksForProject(projectId, { status: taskStatusFilter || undefined });
      setTasks(fetchedTasks);
    } catch (err: any) {
      setTaskError(err.message || 'Не удалось загрузить задачи');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectMembers();
    // Tasks are fetched on demand or when filter changes
  }, [projectId]);

  useEffect(() => {
    // Refetch tasks when filter changes
    if(project) fetchProjectTasks();
  }, [taskStatusFilter, project]);


  // --- Project Edit/Delete Logic ---
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      const updatedProject = await projectService.updateProject(projectId, editFormData);
      setProject(updatedProject);
      setIsEditModalOpen(false);
      alert('Проект обновлен!');
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить проект.');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    if (window.confirm('Вы уверены, что хотите удалить этот проект? Это действие необратимо.')) {
      try {
        await projectService.deleteProject(projectId);
        alert('Проект удален.');
        navigate('/projects');
      } catch (err: any) {
        setError(err.message || 'Не удалось удалить проект.');
      }
    }
  };
  
  // --- Member Management Logic ---
  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !newMemberId.trim() || !newMemberRole.trim()) {
        setMemberError("ID пользователя и роль обязательны.");
        return;
    }
    try {
        await projectService.addProjectMember(projectId, newMemberId, newMemberRole);
        setNewMemberId('');
        setNewMemberRole('');
        setShowAddMemberForm(false);
        fetchProjectMembers(); // Refresh member list
        alert('Участник добавлен!');
    } catch (err:any) {
        setMemberError(err.message || 'Не удалось добавить участника.');
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!projectId) return;
    if (window.confirm('Удалить этого участника из проекта?')) {
        try {
            await projectService.removeProjectMember(projectId, memberUserId);
            fetchProjectMembers(); // Refresh member list
            alert('Участник удален.');
        } catch (err:any) {
            setMemberError(err.message || 'Не удалось удалить участника.');
        }
    }
  };
  
  // --- Task Management Logic ---
  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewTaskData({ ...newTaskData, [e.target.name]: e.target.value });
  };
  
  const handleEditTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditTaskData({ ...editTaskData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !newTaskData.title?.trim()) {
        setTaskError("Название задачи обязательно.");
        return;
    }
    try {
        await projectService.createTask(projectId, newTaskData as TaskCreationData);
        setNewTaskData({ title: '', description: '', status: 'todo' });
        setShowAddTaskForm(false);
        fetchProjectTasks(); // Refresh task list
        alert('Задача создана!');
    } catch (err:any) {
        setTaskError(err.message || 'Не удалось создать задачу.');
    }
  };
  
  const openEditTaskModal = (task: ProjectTask) => {
    setEditingTask(task);
    setEditTaskData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' // Format for input type="date"
    });
  };

  const handleUpdateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !editingTask) return;
    try {
        // Handle empty assigneeId as null
        const dataToUpdate = { ...editTaskData };
        if (dataToUpdate.assigneeId === '') {
            dataToUpdate.assigneeId = null;
        }
         if (dataToUpdate.dueDate === '') {
            dataToUpdate.dueDate = null;
        }

        await projectService.updateTask(projectId, editingTask.id, dataToUpdate);
        setEditingTask(null);
        fetchProjectTasks(); // Refresh task list
        alert('Задача обновлена!');
    } catch (err:any) {
        setTaskError(err.message || 'Не удалось обновить задачу.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    if (window.confirm('Удалить эту задачу?')) {
        try {
            await projectService.deleteTask(projectId, taskId);
            fetchProjectTasks(); // Refresh task list
            alert('Задача удалена.');
        } catch (err:any) {
            setTaskError(err.message || 'Не удалось удалить задачу.');
        }
    }
  };


  const isOwner = user?.id === project?.ownerId;
  const isAdmin = user?.role === 'admin';
  // A project member can be the owner, an admin, or explicitly listed in members.
  // This check is simplified; backend `checkProjectMembership` is more robust for task operations.
  const isProjectMember = isOwner || isAdmin || members.some(m => m.id === user?.id);


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error || 'Проект не найден'}</div>
      </div>
    );
  }

  const isFounder = user?.id === project.founder.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Создан {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!isFounder && user?.role === 'specialist' && (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isApplying ? 'Отправка...' : 'Откликнуться'}
              </button>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Описание</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{project.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Требуемые навыки</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Основатель проекта</h2>
            <div className="mt-2">
              <p className="text-gray-600">{project.founder.name}</p>
              <p className="text-gray-500 text-sm">{project.founder.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;