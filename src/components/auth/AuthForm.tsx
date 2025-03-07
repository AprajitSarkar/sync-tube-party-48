
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormData = z.infer<typeof formSchema>;

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, signInWithGoogle, isLoading } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSignUp) {
      await signUp(data.email, data.password);
    } else {
      await signIn(data.email, data.password);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

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

        <CustomButton 
          type="button" 
          className="w-full mb-6" 
          variant="outline"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 11-6.18-5.984c1.694 0 3.232.704 4.345 1.825l2.882-2.882C11.828 9.24 9.5 8.061 6.844 8.061c-5.302 0-9.606 4.304-9.606 9.606s4.304 9.606 9.606 9.606c9.149 0 11.057-8.542 10.127-16.158h-14.4v4.18h9.28z"
            />
          </svg>
          Continue with Google
        </CustomButton>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-muted-foreground text-sm">or</span>
          <div className="flex-1 border-t border-white/10"></div>
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
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-accent hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
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
