
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormData = z.infer<typeof formSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Check if the user is coming from a "forgot password" link
    if (searchParams.get('forgotPassword') === 'true') {
      setIsForgotPassword(true);
    }
  }, [searchParams]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSignUp) {
      await signUp(data.email, data.password);
    } else {
      await signIn(data.email, data.password);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    await resetPassword(data.email);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  if (isForgotPassword) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <GlassCard className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-1 text-enhanced">
              Forgot Password
            </h2>
            <p className="text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>

          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-5">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-enhanced-muted">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your@email.com" 
                        {...field} 
                        className="h-12 bg-white/5 border-white/20 focus-visible:ring-primary input-glow"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CustomButton 
                type="submit" 
                className="w-full mt-6" 
                isLoading={isLoading}
                variant="glow"
                icon={<Mail size={18} />}
              >
                Send Reset Link
              </CustomButton>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-enhanced-muted">
              Remember your password?
              <button
                onClick={() => setIsForgotPassword(false)}
                className="ml-1 text-accent hover:underline focus:outline-none"
              >
                Back to Sign In
              </button>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <GlassCard className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-1 text-enhanced">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-muted-foreground">
            {isSignUp 
              ? 'Sign up to start watching together' 
              : 'Sign in to continue your journey'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-enhanced-muted">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      className="h-12 bg-white/5 border-white/20 focus-visible:ring-primary input-glow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-enhanced-muted">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="h-12 bg-white/5 border-white/20 focus-visible:ring-primary input-glow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-accent hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <CustomButton 
              type="submit" 
              className="w-full mt-6" 
              isLoading={isLoading}
              variant="glow"
              icon={isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CustomButton>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-xs text-muted-foreground">OR</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <CustomButton 
          onClick={handleGoogleSignIn}
          className="w-full" 
          variant="outline"
          isLoading={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="mr-2">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </CustomButton>

        <div className="mt-6 text-center">
          <p className="text-sm text-enhanced-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-accent hover:underline focus:outline-none"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AuthForm;
