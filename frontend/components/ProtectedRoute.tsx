"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CoffeeLoader } from './CoffeeLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireAdmin && user.role !== 'admin') {
        router.push('/waiter');
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading) {
    return <CoffeeLoader message="Loading..." />;
  }

  if (!user || (requireAdmin && user.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}
