import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: ReactNode;
}

/**
 * Wraps premium content. Behaviour:
 *  - Auth still loading    → full-page spinner
 *  - No user               → redirect to /auth
 *  - Onboarding incomplete → redirect to /onboarding (except when already there)
 *  - User present + done   → render children
 */
export function ProtectedRoute({ children }: Props) {
  const { user, loading, onboardingCompleted } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-border" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground tracking-widest uppercase">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Gate new users to onboarding — never redirect if they're already there
  if (!onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
