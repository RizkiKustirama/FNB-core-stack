import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect('/login');
    }

    if ((session.user as any).role === 'ADMIN') {
      redirect('/dashboard');
    } else {
      redirect('/pos');
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Home Page Auth Error:', err);
    redirect('/login');
  }
}
