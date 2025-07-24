import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import CreateDocumentForm from '@/components/CreateDocumentForm';

export default async function CreateDocumentPage() {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is official
  if (!session.user.roles.includes(UserRole.OFFICIAL)) {
    redirect('/docs');
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 font-serif mb-4'>Yeni Sənəd Əlavə Et</h1>
          <p className='text-xl text-gray-700 font-serif'>Yeni rəsmi sənəd əlavə edin.</p>
        </div>

        {/* Form */}
        <CreateDocumentForm />
      </div>
    </div>
  );
}
