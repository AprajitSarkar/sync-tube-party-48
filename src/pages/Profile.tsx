
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, KeyRound, Trash2, LogOut, Music } from 'lucide-react';
import PageTransition from '@/components/common/PageTransition';
import UserPlaylistManager from '@/components/profile/UserPlaylistManager';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, updatePassword, deleteAccount, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsPasswordChanging(true);
    try {
      await updatePassword(data.newPassword);
      passwordForm.reset();
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    navigate('/auth');
  };

  return (
    <PageTransition>
      <div 
        className="min-h-screen bg-background p-4 sm:p-6"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(142, 45, 226, 0.08) 0%, transparent 70%)"
        }}
      >
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gradient">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
            <CustomButton 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/home')}
            >
              Back to Home
            </CustomButton>
          </header>
          
          <Tabs defaultValue="account" className="mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-full glass-effect flex items-center justify-center">
                      <User size={32} className="text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-enhanced">Account Information</h2>
                      <p className="text-muted-foreground mb-4">Update your account details and preferences</p>
                      
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm text-enhanced-muted mb-1">Email</label>
                          <Input 
                            value={user?.email || ''} 
                            disabled 
                            className="bg-white/5 border-white/20"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Your email cannot be changed</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-enhanced-muted mb-1">User ID</label>
                          <Input 
                            value={user?.id || ''} 
                            disabled 
                            className="bg-white/5 border-white/20"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Your unique identifier</p>
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <Separator className="my-6 bg-white/10" />
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-enhanced">Danger Zone</h3>
                      <p className="text-muted-foreground text-sm">Permanently delete your account and all data</p>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <CustomButton 
                          variant="outline" 
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          icon={<Trash2 size={16} />}
                        >
                          Delete Account
                        </CustomButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all associated data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
            
            <TabsContent value="security">
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full glass-effect flex items-center justify-center">
                      <KeyRound size={24} className="text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-enhanced">Security Settings</h2>
                      <p className="text-muted-foreground mb-6">Update your password and security preferences</p>
                      
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-enhanced-muted">Current Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="bg-white/5 border-white/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-enhanced-muted">New Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="bg-white/5 border-white/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-enhanced-muted">Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="bg-white/5 border-white/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <CustomButton 
                            type="submit" 
                            className="w-full mt-2" 
                            isLoading={isPasswordChanging}
                          >
                            Update Password
                          </CustomButton>
                        </form>
                      </Form>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
            
            <TabsContent value="playlists">
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full glass-effect flex items-center justify-center">
                      <Music size={24} className="text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-enhanced">Your Playlists</h2>
                      <p className="text-muted-foreground mb-6">Manage your saved playlists</p>
                      
                      <UserPlaylistManager />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-center mt-8">
            <CustomButton 
              variant="outline" 
              onClick={handleSignOut}
              icon={<LogOut size={16} />}
            >
              Sign Out
            </CustomButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
