import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: number;
  title: string;
  description: string;
  skills: string[];
  founder: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/projects/${id}`);
      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Ошибка при загрузке проекта');
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setIsApplying(true);
      await axios.post(`http://localhost:3000/api/projects/${id}/apply`);
      navigate('/messages');
    } catch (error) {
      console.error('Error applying to project:', error);
      setError('Ошибка при отправке заявки');
      setIsApplying(false);
    }
  };

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