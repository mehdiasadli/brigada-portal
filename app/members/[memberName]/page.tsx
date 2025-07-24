import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { MemberStatus, UserRole } from '@prisma/client';
import MemberActions from '@/components/MemberActions';
import { getMemberStatusDisplayName } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    memberName: string;
  }>;
}

// Generate member slug from name (same logic as in members page)
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Generate dynamic metadata for member pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  // Find all members to match by slug
  const members = await prisma.member.findMany({
    include: {
      user: {
        select: {
          name: true,
          roles: true,
        },
      },
    },
  });

  // Find the member whose name generates the same slug as the URL parameter
  const member = members.find((m) => generateSlug(m.name) === decodeURIComponent(resolvedParams.memberName));

  if (!member) {
    return {
      title: 'Üzv tapılmadı',
      description: 'Axtardığınız üzv mövcud deyil.',
    };
  }

  const statusDisplay = getMemberStatusDisplayName(member.status);
  const description = member.bio
    ? `${member.bio.substring(0, 150)}...`
    : `${member.name} - Brigada İcmasının üzvü. ${member.title ? member.title + '. ' : ''}${member.organization ? member.organization + '-də çalışır. ' : ''}${statusDisplay} statusunda.`;

  return {
    title: `${member.name} - Üzv Profili`,
    description,
    keywords: [
      member.name,
      'Brigada üzvü',
      'icma üzvü',
      'üzv profili',
      member.title || '',
      member.organization || '',
      'əlaqə məlumatları',
    ].filter(Boolean),
    authors: [{ name: 'Brigada Portal' }],
    creator: 'Brigada Portal',
    publisher: 'Brigada İcması',

    openGraph: {
      title: `${member.name} - Brigada Portal`,
      description,
      url: `/members/${encodeURIComponent(generateSlug(member.name))}`,
      type: 'profile',
      images: [
        {
          url: member.avatarUrl || '/og.png',
          width: member.avatarUrl ? 400 : 1200,
          height: member.avatarUrl ? 400 : 630,
          alt: `${member.name} profil şəkli`,
        },
      ],
    },

    twitter: {
      title: `${member.name} - Brigada Portal`,
      description,
      creator: '@brigada_portal',
    },

    alternates: {
      canonical: `/members/${encodeURIComponent(generateSlug(member.name))}`,
    },

    other: {
      'profile:first_name': member.name.split(' ')[0],
      'profile:last_name': member.name.split(' ').slice(1).join(' '),
      'profile:username': generateSlug(member.name),
    },
  };
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusColor = (status: MemberStatus) => {
  switch (status) {
    case MemberStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case MemberStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case MemberStatus.BANNED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSocialIcon = (platform: string) => {
  const icons: { [key: string]: string } = {
    instagram: '📷',
    github: '🐙',
    facebook: '📘',
    x: '🐦',
    linkedin: '💼',
  };
  return icons[platform] || '🔗';
};

export default async function MemberPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user) {
    return redirect('/login');
  }

  // Find member by matching the slug generated from their name
  const members = await prisma.member.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          roles: true,
        },
      },
    },
  });

  // Find the member whose name generates the same slug as the URL parameter
  const member = members.find((m) => generateSlug(m.name) === decodeURIComponent(resolvedParams.memberName));

  if (!member) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Back to Members */}
        <div className='mb-8'>
          <Link href='/members' className='inline-flex items-center text-blue-700 hover:text-blue-900 font-serif'>
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Üzvlərin siyahısına qayıt
          </Link>
        </div>

        {/* Member Header */}
        <div className='bg-gray-50 rounded-lg p-8 mb-8 border'>
          <div className='flex flex-col md:flex-row md:items-start md:space-x-8'>
            {/* Avatar */}
            <div className='flex-shrink-0 mb-6 md:mb-0'>
              {member.avatarUrl ? (
                <img
                  className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg'
                  src={member.avatarUrl}
                  alt={member.name}
                />
              ) : (
                <div className='w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                  <span className='text-white font-serif font-bold text-4xl'>
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className='flex-1'>
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4'>
                <div>
                  <h1 className='text-4xl font-bold text-gray-900 font-serif mb-2'>{member.name}</h1>
                  {member.title && <p className='text-xl text-gray-600 font-serif mb-2'>{member.title}</p>}
                  {member.organization && (
                    <p className='text-lg text-gray-500 font-serif mb-4'>{member.organization}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${getStatusColor(member.status)}`}
                >
                  {getMemberStatusDisplayName(member.status)}
                </span>
              </div>

              {/* Bio */}
              {member.bio && (
                <div className='mb-6'>
                  <p className='text-gray-700 font-serif leading-relaxed'>{member.bio}</p>
                </div>
              )}

              {/* User Role Information */}
              {member.user && (
                <div className='mb-4'>
                  <h3 className='text-sm font-medium text-gray-900 font-serif mb-2'>System Roles</h3>
                  <div className='flex flex-wrap gap-2'>
                    {member.user.roles.map((role) => (
                      <span
                        key={role}
                        className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium font-serif'
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className='text-sm text-gray-500 font-serif'>Qoşulma tarixi: {formatDate(member.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='grid md:grid-cols-2 gap-8 mb-8'>
          {/* Contact Details */}
          <div className='bg-white p-6 rounded-lg border'>
            <h2 className='text-2xl font-bold text-gray-900 font-serif mb-6'>Əlaqə Məlumatları</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>E-poçt</label>
                <a href={`mailto:${member.email}`} className='text-blue-700 hover:underline font-serif'>
                  {member.email}
                </a>
              </div>

              {member.mobileNumbers && member.mobileNumbers.length > 0 && (
                <div>
                  <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Telefon Nömrələri</label>
                  <div className='space-y-1'>
                    {member.mobileNumbers.map((phone, index) => (
                      <a key={index} href={`tel:${phone}`} className='block text-blue-700 hover:underline font-serif'>
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {member.dateOfBirth && (
                <div>
                  <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Doğum Tarixi</label>
                  <p className='text-gray-700 font-serif'>{formatDate(member.dateOfBirth)}</p>
                </div>
              )}

              {member.placeOfBirth && (
                <div>
                  <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Doğum Yeri</label>
                  <p className='text-gray-700 font-serif'>{member.placeOfBirth}</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className='bg-white p-6 rounded-lg border'>
            <h2 className='text-2xl font-bold text-gray-900 font-serif mb-6'>Sosial Şəbəkələr</h2>
            <div className='space-y-4'>
              {[
                { key: 'instagram', label: 'Instagram', value: member.instagram },
                { key: 'github', label: 'GitHub', value: member.github },
                { key: 'facebook', label: 'Facebook', value: member.facebook },
                { key: 'x', label: 'X (Twitter)', value: member.x },
                { key: 'linkedin', label: 'LinkedIn', value: member.linkedin },
              ].map(
                ({ key, label, value }) =>
                  value && (
                    <div key={key}>
                      <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>
                        {getSocialIcon(key)} {label}
                      </label>
                      <a
                        href={value.startsWith('http') ? value : `https://${value}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-700 hover:underline font-serif'
                      >
                        {value}
                      </a>
                    </div>
                  )
              )}

              {!member.instagram && !member.github && !member.facebook && !member.x && !member.linkedin && (
                <p className='text-gray-500 font-serif italic'>Sosial şəbəkə linkləri mövcud deyil</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className='bg-white p-6 rounded-lg border mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 font-serif mb-6'>Karyera Məlumatları</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Vəzifə</label>
              <p className='text-gray-700 font-serif mb-4'>{member.title || 'Not specified'}</p>

              <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Təşkilat</label>
              <p className='text-gray-700 font-serif'>{member.organization || 'Not specified'}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Status</label>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium font-serif ${getStatusColor(member.status)}`}
              >
                {member.status.charAt(0).toUpperCase() + member.status.slice(1).toLowerCase()}
              </span>

              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-500 font-serif mb-1'>Son Yenilənmə Tarixi</label>
                <p className='text-gray-700 font-serif'>{formatDate(member.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-blue-50 p-6 rounded-lg border'>
          <h2 className='text-xl font-bold text-gray-900 font-serif mb-4'>Sürətli Əməliyyatlar</h2>
          <div className='flex flex-col flex-wrap gap-4'>
            <div className='flex flex-wrap gap-4'>
              <a
                href={`mailto:${member.email}`}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg font-serif hover:bg-blue-700 transition-colors inline-flex items-center'
              >
                <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
                E-poçt göndər
              </a>

              {member.mobileNumbers && member.mobileNumbers.length > 0 && (
                <a
                  href={`tel:${member.mobileNumbers[0]}`}
                  className='bg-gray-600 text-white px-4 py-2 rounded-lg font-serif hover:bg-gray-700 transition-colors inline-flex items-center'
                >
                  <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                  Zəng et
                </a>
              )}

              <Link
                href='/members'
                className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-serif hover:bg-gray-200 transition-colors inline-flex items-center mt-4'
              >
                <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                Bütün üzvlərin siyahısını gör
              </Link>
            </div>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8'>
              <h3 className='text-lg font-medium text-gray-900 font-serif mb-3'>Üzv Əməliyyatları</h3>
              <MemberActions
                memberName={member.name}
                memberId={member.id}
                memberUserId={member.userId}
                memberUserRoles={member.user?.roles || null}
                currentUserId={session.user.id}
                currentUserRoles={session.user.roles as UserRole[]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
