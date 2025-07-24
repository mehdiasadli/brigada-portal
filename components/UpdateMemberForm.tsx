'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MemberStatus } from '@prisma/client';

interface Member {
  id: string;
  name: string;
  avatarUrl: string | null;
  dateOfBirth: Date;
  placeOfBirth: string;
  bio: string | null;
  status: MemberStatus;
  email: string;
  mobileNumbers: string[];
  instagram: string | null;
  github: string | null;
  facebook: string | null;
  x: string | null;
  linkedin: string | null;
  title: string | null;
  organization: string | null;
  userId: string | null;
  user?: {
    id: string;
    name: string;
    roles: string[];
  } | null;
}

interface UpdateMemberFormProps {
  member: Member;
}

export default function UpdateMemberForm({ member }: UpdateMemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: member.name,
    bio: member.bio || '',
    status: member.status,
    email: member.email,
    dateOfBirth: member.dateOfBirth.toISOString().split('T')[0],
    placeOfBirth: member.placeOfBirth,
    avatarUrl: member.avatarUrl || '',
    mobileNumbers: member.mobileNumbers,
    instagram: member.instagram || '',
    github: member.github || '',
    facebook: member.facebook || '',
    x: member.x || '',
    linkedin: member.linkedin || '',
    title: member.title || '',
    organization: member.organization || '',
  });

  const [mobileInput, setMobileInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle mobile number operations
  const handleAddMobile = () => {
    if (mobileInput.trim() && !formData.mobileNumbers.includes(mobileInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        mobileNumbers: [...prev.mobileNumbers, mobileInput.trim()],
      }));
      setMobileInput('');
    }
  };

  const handleRemoveMobile = (mobileToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.filter((mobile) => mobile !== mobileToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMobile();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const memberSlug = formData.name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/members/${memberSlug}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update member');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('An error occurred while updating the member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-xl font-medium text-gray-900 font-serif mb-6'>Əsas Məlumatlar</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Tam adı daxil edin'
              />
            </div>

            <div>
              <label htmlFor='status' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Status *
              </label>
              <select
                id='status'
                name='status'
                required
                value={formData.status}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value={MemberStatus.ACTIVE}>Aktiv</option>
                <option value={MemberStatus.INACTIVE}>Deaktiv</option>
                <option value={MemberStatus.BANNED}>Cəzalı</option>
              </select>
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Doğum yeri daxil edin'
              />
            </div>

            <div className='md:col-span-2'>
              <label htmlFor='avatarUrl' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Profil şəkli URL-i *
              </label>
              <input
                type='url'
                id='avatarUrl'
                name='avatarUrl'
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='https://example.com/avatar.jpg'
              />
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
              onChange={handleInputChange}
              className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical'
              placeholder='Üzv haqqında təsvir'
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-xl font-medium text-gray-900 font-serif mb-6'>Əlaqə Məlumatları</h3>

          <div className='grid grid-cols-1 gap-6'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                E-poçt *
              </label>
              <input
                type='email'
                id='email'
                name='email'
                required
                value={formData.email}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='member@example.com'
              />
            </div>

            {/* Mobile Numbers */}
            <div>
              <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Telefon Nömrələri</label>
              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <input
                    type='tel'
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Telefon nömrəsini daxil edin və Enter düyməsini basın'
                  />
                  <button
                    type='button'
                    onClick={handleAddMobile}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-serif'
                  >
                    Əlavə et
                  </button>
                </div>

                {formData.mobileNumbers.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {formData.mobileNumbers.map((mobile) => (
                      <span
                        key={mobile}
                        className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-serif flex items-center gap-1'
                      >
                        {mobile}
                        <button
                          type='button'
                          onClick={() => handleRemoveMobile(mobile)}
                          className='text-blue-600 hover:text-blue-800'
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-xl font-medium text-gray-900 font-serif mb-6'>Karyera Məlumatları</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='title' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Vəzifə
              </label>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Təşkilatı daxil edin'
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h3 className='text-xl font-medium text-gray-900 font-serif mb-6'>Sosial Şəbəkələr</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='linkedin' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                LinkedIn
              </label>
              <input
                type='url'
                id='linkedin'
                name='linkedin'
                value={formData.linkedin}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='https://linkedin.com/in/username'
              />
            </div>

            <div>
              <label htmlFor='x' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                X (Twitter)
              </label>
              <input
                type='url'
                id='x'
                name='x'
                value={formData.x}
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='https://x.com/username'
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='https://facebook.com/username'
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='https://instagram.com/username'
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
                onChange={handleInputChange}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='https://github.com/username'
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex items-center justify-between'>
          <Link
            href={`/members/${member.name.toLowerCase().replace(/\s+/g, '-')}`}
            className='px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-serif hover:bg-gray-200 transition-colors'
          >
            Ləğv et
          </Link>

          <button
            type='submit'
            disabled={isSubmitting || !formData.name || !formData.email}
            className='px-8 py-3 bg-blue-600 text-white rounded-lg font-serif hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {isSubmitting ? 'Yenilənir...' : 'Üzvü yenilə'}
          </button>
        </div>
      </form>
    </>
  );
}
