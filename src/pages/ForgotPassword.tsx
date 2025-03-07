
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
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/common/PageTransition';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormData = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const { resetPassword, isLoading } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    await resetPassword(data.email);
    setEmailSent(true);
  };

  return (
    <PageTransition>
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center bg-background py-8 px-4"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(142, 45, 226, 0.08) 0%, transparent 70%)"
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-4"
        >
          <Link to="/auth" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to Sign In
          </Link>
          
          <GlassCard className="p-6 sm:p-8">
            {emailSent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-enhanced">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <Link to="/auth">
                  <CustomButton variant="outline" className="w-full">
                    Return to Sign In
                  </CustomButton>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-1 text-enhanced">Reset Password</h2>
                  <p className="text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password
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
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
