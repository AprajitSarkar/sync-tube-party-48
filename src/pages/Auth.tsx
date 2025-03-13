
import React, { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Auth = () => {
  const {
    user,
    isLoading,
    signInWithGoogle
  } = useAuth();
  
  const location = useLocation();
  
  // Handle deep linking from Android app
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');
    const googleAuth = searchParams.get('googleAuth');
    
    // Check if coming from the Android app with Google Auth intent
    if (source === 'android' && googleAuth === 'true') {
      // Trigger Google Auth in the web app
      signInWithGoogle();
    }
  }, [location.search, signInWithGoogle]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>;
  }
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background py-8 px-4" style={{
    backgroundImage: "radial-gradient(circle at center, rgba(142, 45, 226, 0.08) 0%, transparent 70%)"
  }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-center mb-8 w-full max-w-md px-4"
      >
        <h1 className="text-4xl font-bold mb-2 text-gradient">WatchTube</h1>
        <p className="text-muted-foreground">Watch together, anytime, anywhere.</p>
      </motion.div>

      <AuthForm />
    </div>;
};

export default Auth;
