import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjusted path
import axios from 'axios';
// import { currentUser } from '../data/mockData'; // Mock data, can be removed or adjusted
import SkillTag from '../components/shared/SkillTag'; // Adjusted path
import Badge from '../components/ui/Badge'; // Adjusted path
import Button from '../components/ui/Button'; // Adjusted path
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'; // Adjusted path
import { Mail, MapPin, Calendar, Edit } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  role: 'specialist' | 'founder';
  skills?: string[];
  bio?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth(); // user might be null if not logged in, handle accordingly
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '', // Initialize with user data if available
    email: user?.email || '', // Initialize with user data if available
    role: user?.role || 'specialist', // Initialize with user data if available
    skills: user?.skills || [],
    bio: user?.bio || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch profile data if user is available and profileData is not yet populated
    if (user && !profileData.email) { // Assuming email is a good indicator
      fetchProfile();
    }
  }, [user]); // Re-fetch if user changes

  const fetchProfile = async () => {
    // In a real Next.js app, this would typically be an API route
    // For now, we can simulate fetching or use user data directly if already in AuthContext
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'specialist',
        skills: user.skills || [],
        bio: user.bio || '',
      });
    }
    // Example API call (replace with your actual API endpoint)
    // try {
    //   const response = await axios.get('/api/profile'); // Next.js API route
    //   setProfileData(response.data);
    // } catch (error) {
    //   console.error('Error fetching profile:', error);
    //   setMessage('Ошибка при загрузке профиля');
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint for updating profile
      // const response = await axios.put('/api/profile', profileData);
      // setProfileData(response.data); // Update with response from server
      console.log("Profile data to save:", profileData); // Placeholder
      setMessage('Профиль успешно обновлен (симуляция)');
      setIsEditing(false);
    } catch (error) {
      setMessage('Ошибка при обновлении профиля');
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // If user is not yet available (still loading from AuthContext), show loading or nothing
  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Профиль</h3>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Редактировать
              </Button>
            )}
          </div>
          
          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.includes('Ошибка') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={true} // Email usually not editable or handled differently
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Роль
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={profileData.role}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="specialist">Специалист</option>
                    <option value="founder">Основатель стартапа</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Дополнительная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.role === 'specialist' && (
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                      Навыки (через запятую)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      value={profileData.skills?.join(', ')}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        skills: e.target.value.split(',').map(skill => skill.trim())
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g., React, Node.js, Python"
                    />
                    <div className="mt-2">
                      {profileData.skills?.map(skill => (
                        <SkillTag key={skill} skill={skill} />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    О себе
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Расскажите немного о себе..."
                  />
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <Button type="button" onClick={() => { setIsEditing(false); fetchProfile(); /* Revert changes */ }} variant="outline">
                  Отмена
                </Button>
                <Button type="submit">
                  Сохранить изменения
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
