import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // லாகின் செய்யவில்லை என்றால் தானாக லாகின் பக்கத்திற்கு திருப்பிவிடும்
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;