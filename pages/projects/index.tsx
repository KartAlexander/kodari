import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Replaced react-router-dom Link
import axios from 'axios'; // Keep axios for data fetching

interface Project {
  id: number;
  title: string;
  description: string;
  skills: string[];
  founder: {
    id: number; // Assuming founder might have an ID
    name: string;
  };
  createdAt: string; // Keep as string, format on client
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Replace with your actual API endpoint for projects if different
      // For Next.js, you might use getStaticProps or getServerSideProps for initial data
      // or fetch client-side as done here.
      const response = await axios.get('/api/projects'); // Example: using a Next.js API route
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Ошибка при загрузке проектов');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Загрузка проектов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Проекты</h1>
        <Link href="/projects/new" legacyBehavior>
          <a className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
            Создать проект
          </a>
        </Link>
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center text-gray-500">
          <p>Пока нет доступных проектов. Создайте первый!</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} legacyBehavior>
            <a className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate">{project.title}</h2>
                <p className="text-gray-600 mb-4 h-20 overflow-hidden text-ellipsis line-clamp-3">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4 h-12 overflow-y-auto">
                  {project.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">Основатель: {project.founder.name}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
