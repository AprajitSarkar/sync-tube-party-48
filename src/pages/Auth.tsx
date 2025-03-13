
import React, { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { auth, getRedirectResult } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const {
    user,
    isLoading
  } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  // Handle Firebase redirect authentication on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast({
            title: "Firebase Login Successful",
            description: `Welcome back, ${result.user.displayName || result.user.email}!`
          });
        }
      } catch (error: any) {
        console.error("Firebase redirect error:", error);
        if (error.code !== 'auth/cancelled-popup-request') {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    };

    checkRedirectResult();
  }, []);
  
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
