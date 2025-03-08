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
import { LogIn, UserPlus, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  password: z.string().min(1, {
    message: 'Password is required'
  })
});

const signUpSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters'
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type FormData = SignInFormData | SignUpFormData;

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const navigate = useNavigate();
  
  const {
    signIn,
    signUp,
    signInWithGoogle,
    isLoading,
    resendConfirmationEmail
  } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignUp && { acceptTerms: false })
    }
  });

  useEffect(() => {
    form.reset({
      email: '',
      password: '',
      ...(isSignUp && { acceptTerms: false })
    });
  }, [isSignUp, form]);

  const onSubmit = async (data: FormData) => {
    setLoginError('');
    setEmailAddress(data.email);
    
    try {
      if (isSignUp) {
        const signUpData = data as SignUpFormData;
        
        if (!signUpData.acceptTerms) {
          toast({
            title: "Terms Required",
            description: "You must accept the terms and conditions to create an account",
            variant: "destructive"
          });
          return;
        }
        
        await signUp(data.email, data.password);
        setShowWelcomeDialog(true);
        navigate('/home');
      } else {
        const result = await signIn(data.email, data.password);
        
        if (result?.error) {
          if (result.error === 'Email not confirmed') {
            setEmailSent(true);
          } else {
            setLoginError(result.error);
            console.log("Authentication error:", result.error);
          }
        } else if (result?.data) {
          navigate('/home');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setLoginError('Authentication failed. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    const email = emailAddress || form.getValues('email');
    
    if (email) {
      await resendConfirmationEmail(email);
      setEmailSent(true);
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
      className="w-full max-w-md px-0 py-0 my-0 mx-0"
    >
      <GlassCard className="p-6 sm:p-8">
        {emailSent ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-enhanced">Check Your Email</h2>
            <p className="text-muted-foreground mb-4">
              We've sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            <CustomButton 
              type="button" 
              variant="outline" 
              onClick={handleResendEmail}
              className="mt-2"
            >
              Resend confirmation email
            </CustomButton>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-1 text-enhanced">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-muted-foreground">
                {isSignUp ? 'Sign up to start watching together' : 'Sign in to continue your journey'}
              </p>
            </div>

            <CustomButton 
              type="button" 
              className="w-full mb-6 flex items-center justify-center gap-2" 
              variant="outline" 
              onClick={handleGoogleSignIn}
            >
              <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </CustomButton>

            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-muted-foreground text-sm">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {loginError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
                {loginError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                {isSignUp && (
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            I accept the <Link to="/terms" className="text-accent hover:underline">Terms and Conditions</Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {!isSignUp && (
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-sm text-accent hover:underline transition-colors">
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
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setLoginError('');
                    form.reset();
                  }}
                  className="ml-1 text-accent hover:underline focus:outline-none"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </>
        )}
      </GlassCard>

      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Welcome to WatchTube!</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="mb-4">Thank you for joining WatchTube. Please verify your email to create and join rooms.</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Connect with us:</h3>
                <div className="flex flex-col gap-2">
                  <p>Telegram: <a href="https://t.me/WatchTubeFun" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">@WatchTubeFun</a></p>
                  <p>Instagram: <a href="https://instagram.com/watchtube.fun" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">@watchtube.fun</a></p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <CustomButton 
              onClick={() => setShowWelcomeDialog(false)} 
              icon={<Send size={16} />}
              className="w-full"
            >
              Continue to App
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AuthForm;
