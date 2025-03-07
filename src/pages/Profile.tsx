
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Lock, LogOut, Trash2 } from 'lucide-react';
import UserPlaylistManager from '@/components/profile/UserPlaylistManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const passwordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, signOut, updatePassword, deleteAccount, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const navigate = useNavigate();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Check if we're in password reset mode
    if (searchParams.get('passwordReset') === 'true') {
      setIsPasswordResetMode(true);
      setActiveTab('security');
    }
  }, [searchParams]);

  const onPasswordSubmit = async (data: PasswordFormData) => {
    await updatePassword(data.password);
    form.reset();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  // If user is not logged in
  if (!user && !authLoading) {
    navigate('/auth');
    return null;
  }

  // If we're still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background p-4 sm:p-6"
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(142, 45, 226, 0.08) 0%, transparent 70%)"
      }}
    >
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2 text-gradient">Profile</h1>
        <p className="text-muted-foreground mb-6">Manage your account and playlists</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="account" className="text-base py-3">
              <User size={16} className="mr-2" /> Account
            </TabsTrigger>
            <TabsTrigger value="security" className="text-base py-3">
              <Lock size={16} className="mr-2" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Account type</p>
                  <p className="font-medium">
                    {user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </GlassCard>

            <UserPlaylistManager />

            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
              <div className="space-y-4">
                <CustomButton
                  onClick={handleSignOut}
                  variant="outline"
                  icon={<LogOut size={18} />}
                >
                  Sign Out
                </CustomButton>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <CustomButton
                      variant="destructive"
                      icon={<Trash2 size={18} />}
                    >
                      Delete Account
                    </CustomButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {authLoading ? <LoadingSpinner size="sm" /> : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isPasswordResetMode ? 'Set New Password' : 'Change Password'}
              </h2>
              
              {user?.app_metadata?.provider === 'google' ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    You're signed in with Google. Password management is not available.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              className="h-12 bg-white/5 border-white/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              className="h-12 bg-white/5 border-white/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <CustomButton 
                      type="submit" 
                      className="w-full mt-2" 
                      isLoading={authLoading}
                      variant="glow"
                    >
                      {isPasswordResetMode ? 'Set Password' : 'Update Password'}
                    </CustomButton>
                  </form>
                </Form>
              )}
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Profile;
