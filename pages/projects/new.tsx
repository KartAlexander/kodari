import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Replaced react-router-dom useNavigate
import axios from 'axios'; // Keep axios for API calls
// import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext is at this path

interface ProjectFormData {
  title: string;
  description: string;
  skills: string[];
  // founderId: number; // If you need to associate the project with the logged-in user
}

const NewProjectPage: React.FC = () => {
  // const { user } = useAuth(); // Get user info if needed for founderId
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    skills: [],
    // founderId: user?.id || 0, // Initialize with user's ID if available
  });
  const [error, setError] = useState('');
  const router = useRouter(); // Replaced useNavigate

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill); // Filter out empty strings
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!user) {
    //   setError("Вам нужно войти в систему, чтобы создать проект.");
    //   return;
    // }
    // if (!formData.founderId && user) { // Ensure founderId is set if user is loaded client-side
    //   formData.founderId = user.id;
    // }

    try {
      // Replace with your actual API endpoint for creating projects
      const response = await axios.post('/api/projects', formData); // Example: using a Next.js API route
      router.push('/projects'); // Navigate to projects list on success
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.response?.data?.message || 'Ошибка при создании проекта');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Создать новый проект</h1>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-100 border border-red-400 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Название проекта
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Подробное описание проекта
            </label>
            <textarea
              name="description"
              id="description"
              rows={6}
              required
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Опишите цели проекта, задачи, ожидаемый результат..."
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Требуемые навыки (через запятую)
            </label>
            <input
              type="text"
              name="skills"
              id="skills"
              value={formData.skills.join(', ')}
              onChange={handleSkillsChange}
              placeholder="e.g., React, Node.js, Project Management"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
             <p className="mt-2 text-xs text-gray-500">
              Укажите ключевые технологии, языки программирования или методологии.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/projects')} // Navigate back
              className="bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Опубликовать проект
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectPage;
