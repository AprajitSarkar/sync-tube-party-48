import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, Provider } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { auth, googleProvider, signInWithRedirect, getRedirectResult } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any, error?: string }>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFirebase: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  isEmailVerified: () => boolean;
  isAndroid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isRunningOnAndroid = (): boolean => {
  return window.navigator.userAgent.includes('Android') && 
         window.location.href.includes('intent://');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAndroid, setIsAndroid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsAndroid(isRunningOnAndroid());
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!user) {
          console.log("Firebase user signed in:", firebaseUser.email);
        }
      }
    });

    getRedirectResult(auth).then((result) => {
      if (result) {
        toast({
          title: "Firebase Sign In Successful",
          description: `Welcome ${result.user.displayName || result.user.email}`
        });
      }
    }).catch((error) => {
      if (error.code !== 'auth/cancelled-popup-request') {
        toast({
          title: "Firebase Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeFirebase();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        
        toast({
          title: "Account created!",
          description: "Please check your email for the verification link to get full access."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign in with:", email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('not confirmed') || 
            error.message.toLowerCase().includes('verification') ||
            error.message.toLowerCase().includes('verify')) {
          toast({
            title: "Email not verified",
            description: "Please check your email for the verification link or request a new one.",
            variant: "destructive"
          });
          return { error: 'Email not confirmed' };
        }
        
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
      }

      console.log("Sign in successful:", data);
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
      }
      return { data };
    } catch (error: any) {
      console.error("Unexpected sign in error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithFirebase = async () => {
    try {
      setIsLoading(true);
      
      if (isAndroid) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        toast({
          title: "Firebase Sign In Successful",
          description: `Welcome ${result.user.displayName || result.user.email}`
        });
      }
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request') {
        toast({
          title: "Firebase Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      await firebaseSignOut(auth);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email sent",
        description: "Check your email for the password reset link."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      
      const { error: functionError } = await supabase.rpc('delete_user_account');
      
      if (functionError) throw functionError;
      
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email sent",
        description: "A new confirmation email has been sent to your address."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailVerified = () => {
    if (!user) return false;
    return user.email_confirmed_at !== null;
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading,
      isAndroid, 
      signIn, 
      signUp, 
      signInWithGoogle,
      signInWithFirebase,
      signOut,
      resetPassword,
      updatePassword,
      deleteAccount,
      resendConfirmationEmail,
      isEmailVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
