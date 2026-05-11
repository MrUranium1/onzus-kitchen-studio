import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-12 h-12 text-caramel animate-spin" />
      </div>
    );
  }

  // Allow specific admin emails as a fallback if Firestore check is still propagating
  const isAuthorized = isAdmin || ['hossainmehir2006@gmail.com', 'onzu080@gmail.com'].includes(user?.email?.toLowerCase() || '');

  if (!user || !isAuthorized) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
