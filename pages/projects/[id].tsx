import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Replaced react-router-dom useParams and useNavigate
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
import Button from '../../components/ui/Button'; // Assuming Button component is here
import Spinner from '../../components/ui/Spinner'; // Assuming Spinner component
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert'; // Assuming Alert component
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'; // Assuming Card component
import SkillTag from '../../components/shared/SkillTag'; // Assuming SkillTag component
import { User, Briefcase, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';


interface Project {
  id: number;
  title: string;
  description: string;
  skills: string[];
  founder: {
    id: number;
    name: string;
    email: string; // Included for display
  };
  createdAt: string;
}

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get project ID from router query
  const { user } = useAuth(); // Get current user from auth context
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{success?: string, error?: string} | null>(null);


  useEffect(() => {
    if (id) { // Ensure ID is available before fetching
      fetchProject(id as string);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    setLoading(true);
    setError('');
    try {
      // Replace with your actual API endpoint for fetching a single project
      const response = await axios.get(`/api/projects/${projectId}`); // Example: using a Next.js API route
      setProject(response.data);
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке проекта. Возможно, он не существует.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      setError('Пожалуйста, войдите в систему, чтобы откликнуться на проект.');
      return;
    }
    if (user.role !== 'specialist') {
      setError('Только специалисты могут откликаться на проекты.');
      return;
    }

    setIsApplying(true);
    setApplicationStatus(null);
    try {
      // Replace with your actual API endpoint for applying to a project
      // This might involve sending user ID and project ID
      await axios.post(`/api/projects/${id}/apply`, { userId: user.id });
      setApplicationStatus({ success: 'Ваша заявка успешно отправлена! Основатель проекта свяжется с вами.' });
      // Optionally, navigate to messages or a confirmation page
      // router.push('/messages'); 
    } catch (err: any) {
      console.error('Error applying to project:', err);
      setApplicationStatus({ error: err.response?.data?.message || 'Ошибка при отправке заявки. Попробуйте позже.' });
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error || 'Проект не найден или произошла ошибка при загрузке.'}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
            <Button onClick={() => router.push('/projects')} variant="outline">
                Назад к проектам
            </Button>
        </div>
      </div>
    );
  }

  const isFounder = user?.id === project.founder.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gray-50 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">{project.title}</CardTitle>
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                Создан: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!isFounder && user?.role === 'specialist' && (
              <Button
                onClick={handleApply}
                disabled={isApplying || !!applicationStatus?.success}
                className="mt-4 md:mt-0 min-w-[150px]"
              >
                {isApplying && <Spinner size="sm" className="mr-2" />}
                {applicationStatus?.success ? 'Заявка отправлена' : (isApplying ? 'Отправка...' : 'Откликнуться')}
              </Button>
            )}
             {isFounder && (
                <Badge variant="secondary" className="mt-4 md:mt-0">Это ваш проект</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {applicationStatus?.success && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Успех!</AlertTitle>
              <AlertDescription>{applicationStatus.success}</AlertDescription>
            </Alert>
          )}
          {applicationStatus?.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Ошибка заявки</AlertTitle>
              <AlertDescription>{applicationStatus.error}</AlertDescription>
            </Alert>
          )}

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Описание проекта</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{project.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Требуемые навыки</h2>
            <div className="flex flex-wrap gap-3">
              {project.skills.length > 0 ? project.skills.map((skill) => (
                <SkillTag key={skill} skill={skill} />
              )) : <p className="text-gray-500">Навыки не указаны.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Об основателе</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-primary-600" />
                <p className="text-lg text-gray-800 font-medium">{project.founder.name}</p>
              </div>
              <div className="mt-2 flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href={`mailto:${project.founder.email}`} className="text-primary-600 hover:underline">
                  {project.founder.email}
                </a>
              </div>
            </div>
          </section>
           <div className="pt-6 text-center">
                <Button onClick={() => router.back()} variant="outline">
                    Назад
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
