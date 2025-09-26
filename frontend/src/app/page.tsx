import MainLayout from '@/components/layout/MainLayout';
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to chat by default
  redirect('/chat');
}