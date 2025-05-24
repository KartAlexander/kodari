import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { currentUser } from '../data/mockData';
import SkillTag from '../components/shared/SkillTag';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Mail, MapPin, Calendar, Edit } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  role: 'specialist' | 'founder';
  skills?: string[];
  bio?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    role: 'specialist',
    skills: [],
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3000/api/profile', profileData);
      setMessage('Профиль успешно обновлен');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Профиль</h3>
          
          {message && (
            <div className="mt-4 p-4 rounded-md bg-green-50">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
                disabled={!isEditing}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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

            {profileData.role === 'specialist' && (
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Навыки
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
                  placeholder="Введите навыки через запятую"
                />
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
              />
            </div>

            <div className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Сохранить
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Редактировать
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;