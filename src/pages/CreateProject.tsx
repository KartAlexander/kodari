import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, ProjectCreationData } from '../../services/projectService'; // Updated import

const CreateProject: React.FC = () => {
  // ProjectCreationData by default will include: title, description, status (optional)
  const [formData, setFormData] = useState<ProjectCreationData>({
    title: '',
    description: '',
    status: 'planning', // Default status
  });
  const [error, setError] = useState<string | null>(null); // Changed error type
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
        setError("Название и описание проекта обязательны.");
        setLoading(false);
        return;
    }

    try {
      const newProject = await projectService.createProject(formData);
      // Optionally, show a success message before navigating
      alert('Проект успешно создан!'); // Simple feedback
      navigate(`/projects/${newProject.id}`); // Navigate to the new project's detail page
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Создать новый проект</h1>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-100 border border-red-400 text-red-700">
            <p>{error}</p>
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
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Описание проекта
            </label>
            <textarea
              name="description"
              id="description"
              rows={6}
              required
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Статус проекта
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              disabled={loading}
            >
              <option value="planning">Планирование</option>
              <option value="active">Активный</option>
              <option value="completed">Завершен</option>
              <option value="on_hold">Приостановлен</option>
            </select>
          </div>


          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)} // Go back to previous page
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;