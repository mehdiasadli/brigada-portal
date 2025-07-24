import RegisterForm from '@/components/RegisterForm';
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  if (process.env.NODE_ENV !== 'development') {
    return redirect('/login');
  }

  return <RegisterForm />;
}
