'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MemberStatus } from '@prisma/client';
import { getMemberStatusDisplayName } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface FormData {
  name: string;
  email: string;
  dateOfBirth: string;
  placeOfBirth: string;
  bio: string;
  title: string;
  organization: string;
  status: MemberStatus;
  mobileNumbers: string[];
  instagram: string;
  github: string;
  facebook: string;
  x: string;
  linkedin: string;
  userId: string; // Add userId field
}

export default function CreateMemberForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    dateOfBirth: '',
    placeOfBirth: '',
    bio: '',
    title: '',
    organization: '',
    status: MemberStatus.ACTIVE,
    mobileNumbers: [''],
    instagram: '',
    github: '',
    facebook: '',
    x: '',
    linkedin: '',
    userId: '', // Initialize userId
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch available users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Filter out empty mobile numbers
      const cleanedMobileNumbers = formData.mobileNumbers.filter((num) => num.trim() !== '');

      const response = await fetch('/api/members/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          mobileNumbers: cleanedMobileNumbers,
          userId: formData.userId || undefined, // Include userId if selected
          // Remove empty social links
          instagram: formData.instagram || undefined,
          github: formData.github || undefined,
          facebook: formData.facebook || undefined,
          x: formData.x || undefined,
          linkedin: formData.linkedin || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create member');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/members');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMobileNumberChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.map((num, i) => (i === index ? value : num)),
    }));
  };

  const addMobileNumber = () => {
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: [...prev.mobileNumbers, ''],
    }));
  };

  const removeMobileNumber = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.filter((_, i) => i !== index),
    }));
  };

  if (success) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-8 text-center'>
        <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-green-900 font-serif mb-2'>Üzv uğurla əlavə edildi!</h2>
        <p className='text-green-700 font-serif'>Üzvlərin siyahısına keçid edilir...</p>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 rounded-lg p-8 border'>
      <form onSubmit={handleSubmit} className='space-y-8'>
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
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

        {/* Basic Information */}
        <div>
          <h3 className='text-lg font-medium text-gray-900 font-serif mb-4'>Əsas Məlumatlar</h3>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Tam Ad *
              </label>
              <input
                type='text'
                id='name'
                name='name'
                required
                value={formData.name}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='Tam adı daxil edin'
              />
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Elektron poçt *
              </label>
              <input
                type='email'
                id='email'
                name='email'
                required
                value={formData.email}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='Elektron poçt adresini daxil edin'
              />
            </div>

            {/* User Account Linking */}
            <div className='md:col-span-2'>
              <label htmlFor='userId' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                İstifadəçi Hesabı
              </label>
              <select
                id='userId'
                name='userId'
                value={formData.userId}
                onChange={handleChange}
                disabled={usersLoading}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
              >
                <option value=''>Hesab seçin</option>
                {usersLoading ? (
                  <option disabled>İstifadəçilər yüklənir...</option>
                ) : (
                  availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))
                )}
              </select>
              <p className='mt-1 text-sm text-gray-500 font-serif'>
                Bu üzvü mövcud istifadəçi hesabı ilə əlaqələndirmək üçün hesab seçin.
              </p>
            </div>

            <div>
              <label htmlFor='dateOfBirth' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Doğum Tarixi *
              </label>
              <input
                type='date'
                id='dateOfBirth'
                name='dateOfBirth'
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label htmlFor='placeOfBirth' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Doğum Yeri *
              </label>
              <input
                type='text'
                id='placeOfBirth'
                name='placeOfBirth'
                required
                value={formData.placeOfBirth}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='Doğum yeri daxil edin'
              />
            </div>

            <div>
              <label htmlFor='status' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Status
              </label>
              <select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
              >
                {Object.values(MemberStatus).map((status) => (
                  <option key={status} value={status}>
                    {getMemberStatusDisplayName(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='mt-6'>
            <label htmlFor='bio' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
              Bio
            </label>
            <textarea
              id='bio'
              name='bio'
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
              placeholder='Üzv haqqında məlumat daxil edin'
            />
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className='text-lg font-medium text-gray-900 font-serif mb-4'>Karyera Məlumatları</h3>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='title' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Vəzifə
              </label>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='Vəzifəni daxil edin'
              />
            </div>

            <div>
              <label htmlFor='organization' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Təşkilat
              </label>
              <input
                type='text'
                id='organization'
                name='organization'
                value={formData.organization}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='Təşkilatı daxil edin'
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className='text-lg font-medium text-gray-900 font-serif mb-4'>Əlaqə Məlumatları</h3>
          <div>
            <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Telefon Nömrələri</label>
            {formData.mobileNumbers.map((number, index) => (
              <div key={index} className='flex gap-2 mb-2'>
                <input
                  type='tel'
                  value={number}
                  onChange={(e) => handleMobileNumberChange(index, e.target.value)}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Telefon nömrəsini daxil edin'
                />
                {formData.mobileNumbers.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeMobileNumber(index)}
                    className='px-3 py-2 text-red-600 hover:text-red-800'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={addMobileNumber}
              className='text-blue-600 hover:text-blue-800 font-medium font-serif text-sm'
            >
              + Digər telefon nömrəsi əlavə et
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className='text-lg font-medium text-gray-900 font-serif mb-4'>Sosial Şəbəkələr</h3>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='linkedin' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                LinkedIn
              </label>
              <input
                type='url'
                id='linkedin'
                name='linkedin'
                value={formData.linkedin}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='https://linkedin.com/in/username'
              />
            </div>

            <div>
              <label htmlFor='github' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                GitHub
              </label>
              <input
                type='url'
                id='github'
                name='github'
                value={formData.github}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='https://github.com/username'
              />
            </div>

            <div>
              <label htmlFor='x' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Twitter/X
              </label>
              <input
                type='url'
                id='x'
                name='x'
                value={formData.x}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='https://twitter.com/username'
              />
            </div>

            <div>
              <label htmlFor='instagram' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Instagram
              </label>
              <input
                type='url'
                id='instagram'
                name='instagram'
                value={formData.instagram}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='https://instagram.com/username'
              />
            </div>

            <div>
              <label htmlFor='facebook' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Facebook
              </label>
              <input
                type='url'
                id='facebook'
                name='facebook'
                value={formData.facebook}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='https://facebook.com/username'
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200'>
          <button
            type='submit'
            disabled={isLoading}
            className='bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Üzv əlavə edilir...' : 'Üzv əlavə et'}
          </button>
          <Link
            href='/members'
            className='border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors font-serif text-center'
          >
            Ləğv et
          </Link>
        </div>
      </form>
    </div>
  );
}
