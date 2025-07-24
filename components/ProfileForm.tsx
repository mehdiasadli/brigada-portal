'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    bio: string | null;
    dateOfBirth: Date | null;
    placeOfBirth: string;
    title: string | null;
    organization: string | null;
    avatarUrl: string | null;
    instagram: string | null;
    github: string | null;
    facebook: string | null;
    x: string | null;
    linkedin: string | null;
    status: string;
  } | null;
}

export default function ProfileForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    member: {
      dateOfBirth: '',
      placeOfBirth: '',
      title: '',
      organization: '',
      avatarUrl: '',
      instagram: '',
      github: '',
      facebook: '',
      x: '',
      linkedin: '',
    },
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);

          // Initialize form data
          setFormData({
            name: data.name,
            email: data.email,
            bio: data.member?.bio || '',
            member: {
              dateOfBirth: data.member?.dateOfBirth
                ? new Date(data.member.dateOfBirth).toISOString().split('T')[0]
                : '',
              placeOfBirth: data.member?.placeOfBirth || '',
              title: data.member?.title || '',
              organization: data.member?.organization || '',
              avatarUrl: data.member?.avatarUrl || '',
              instagram: data.member?.instagram || '',
              github: data.member?.github || '',
              facebook: data.member?.facebook || '',
              x: data.member?.x || '',
              linkedin: data.member?.linkedin || '',
            },
          });
        } else {
          setError('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          member: userData?.member ? formData.member : undefined,
        }),
      });

      if (response.ok) {
        router.push('/profile');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('An error occurred while saving the profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('member.')) {
      const memberField = name.replace('member.', '');
      setFormData((prev) => ({
        ...prev,
        member: {
          ...prev.member,
          [memberField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      MODERATOR: 'bg-purple-100 text-purple-800',
      OFFICIAL: 'bg-blue-100 text-blue-800',
      JOURNALIST: 'bg-green-100 text-green-800',
      EDITOR: 'bg-yellow-100 text-yellow-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || colors.USER;
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 font-serif'>Profil məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 font-serif'>Profil məlumatları yüklənə bilmədi</p>
          <Link href='/profile' className='text-blue-600 hover:underline font-serif mt-2 block'>
            Geri qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Breadcrumb */}
        <nav className='mb-8'>
          <div className='flex items-center space-x-2 text-sm font-serif'>
            <Link href='/' className='text-blue-700 hover:underline'>
              Əsas səhifə
            </Link>
            <span className='text-gray-400'>/</span>
            <Link href='/profile' className='text-blue-700 hover:underline'>
              Profil
            </Link>
            <span className='text-gray-400'>/</span>
            <span className='text-gray-600'>Dəyiş</span>
          </div>
        </nav>

        {/* Header */}
        <div className='bg-gray-50 rounded-lg p-8 mb-8 border'>
          <div className='flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6'>
            <div className='w-32 h-32 bg-blue-700 rounded-full flex items-center justify-center'>
              {formData.member.avatarUrl ? (
                <img
                  src={formData.member.avatarUrl}
                  alt={formData.name}
                  className='w-32 h-32 rounded-full object-cover'
                />
              ) : (
                <span className='text-white text-4xl font-bold font-serif'>
                  {formData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              )}
            </div>
            <div className='flex-1 text-center md:text-left'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2 font-serif'>Profili dəyiş</h1>
              <p className='text-gray-600 font-serif mb-4'>Şəxsi və karyera məlumatlarınızı yeniləyin</p>

              {/* Roles */}
              <div className='flex flex-wrap gap-2 mb-4'>
                {userData.roles.map((role) => (
                  <span
                    key={role}
                    className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-3'>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors font-serif disabled:opacity-50'
                >
                  {isSaving ? 'Yenilənir...' : 'Yenilə'}
                </button>
                <Link
                  href='/profile'
                  className='border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors font-serif text-center'
                >
                  Ləğv et
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className='mb-8 bg-red-50 border border-red-200 rounded-md p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-700 font-serif'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='border-b border-gray-200 mb-8'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm font-serif ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Şəxsi Məlumatlar
            </button>
            {userData.member && (
              <button
                onClick={() => setActiveTab('professional')}
                className={`py-2 px-1 border-b-2 font-medium text-sm font-serif ${
                  activeTab === 'professional'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Karyera Məlumatları
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='space-y-8'>
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className='bg-gray-50 rounded-lg p-6 border'>
              <h2 className='text-xl font-bold text-gray-900 mb-6 font-serif'>Şəxsi Məlumatlar</h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Tam Ad</label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>E-poçt</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                {userData.member && (
                  <>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Doğum Tarixi</label>
                      <input
                        type='date'
                        name='member.dateOfBirth'
                        value={formData.member.dateOfBirth}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Doğum Yeri</label>
                      <input
                        type='text'
                        name='member.placeOfBirth'
                        value={formData.member.placeOfBirth}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                      />
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                        Profil şəkli URL-i
                      </label>
                      <input
                        type='url'
                        name='member.avatarUrl'
                        value={formData.member.avatarUrl}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                        placeholder='https://example.com/avatar.jpg'
                      />
                    </div>
                  </>
                )}

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Bio</label>
                  <textarea
                    name='bio'
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Özünüz haqqında qısa məlumat'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Details Tab */}
          {activeTab === 'professional' && userData.member && (
            <div className='space-y-6'>
              <div className='bg-gray-50 rounded-lg p-6 border'>
                <h2 className='text-xl font-bold text-gray-900 mb-6 font-serif'>Karyera Məlumatları</h2>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Vəzifə</label>
                    <input
                      type='text'
                      name='member.title'
                      value={formData.member.title}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Təşkilat</label>
                    <input
                      type='text'
                      name='member.organization'
                      value={formData.member.organization}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className='bg-gray-50 rounded-lg p-6 border'>
                <h3 className='text-lg font-bold text-gray-900 mb-4 font-serif'>Sosial Şəbəkələr</h3>
                <div className='grid md:grid-cols-2 gap-4'>
                  {[
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                    { key: 'x', label: 'Twitter/X', placeholder: 'https://x.com/username' },
                    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
                    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>{label}</label>
                      <input
                        type='url'
                        name={`member.${key}`}
                        value={formData.member[key as keyof typeof formData.member]}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
