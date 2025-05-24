import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { projectService, Project, PaginatedResponse } from '../../services/projectService'; // Updated import
import { useAuth } from '../../contexts/AuthContext'; // To get current user for potential future use

const Projects: React.FC = () => {
  const [paginatedProjects, setPaginatedProjects] = useState<PaginatedResponse<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Changed error type
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Or make this configurable

  const navigate = useNavigate();
  const { user } = useAuth(); // Get authenticated user context

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const fetchProjects = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectService.getProjects({ page, limit: itemsPerPage });
      setPaginatedProjects(response);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Ошибка при загрузке проектов');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (paginatedProjects && currentPage < paginatedProjects.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    // Error and No Projects states handled within the main return
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Проекты</h1>
          {user && ( // Only show Create Project button if user is logged in
            <button
              onClick={() => navigate('/projects/new')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Создать проект
            </button>
          )}
        </div>

        {loading && <div className="text-center">Загрузка...</div>}
        {error && <div className="text-center text-red-600 p-4 bg-red-100 rounded-md">{error}</div>}
        
        {!loading && !error && paginatedProjects && paginatedProjects.items.length === 0 && (
          <div className="text-center text-gray-500">Проектов пока нет.</div>
        )}

        {!loading && !error && paginatedProjects && paginatedProjects.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProjects.items.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    
                    {/* Skills are not directly in Project model from backend, this part needs adjustment if skills are needed */}
                    {/* <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills?.map((skill, index) => ( // Assuming skills might be optional or fetched differently
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div> */}

                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                      <span>Владелец: {project.owner?.username || project.ownerId}</span>
                      <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                     <div className="text-sm text-gray-500 mt-1">
                        Статус: <span className="font-medium text-gray-700">{project.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50"
              >
                Назад
              </button>
              <span className="text-gray-700">
                Страница {paginatedProjects.currentPage} из {paginatedProjects.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === paginatedProjects.totalPages}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          </>
        )}
      </div>
    );
};

export default Projects;