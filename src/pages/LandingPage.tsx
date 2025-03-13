import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/custom-button';
import { Play, Users, Download, Music } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { toast } from '@/hooks/use-toast';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if running on Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      // Try to open the app if installed
      tryOpenAndroidApp();
    }
  }, []);

  const tryOpenAndroidApp = () => {
    // The intent URL for the Android app
    const appUrl = 'intent://watchtube.fun/#Intent;scheme=https;package=com.multiple.cozmo;end';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.multiple.cozmo';
    const webFallbackUrl = window.location.href;
    
    // Create a hidden iframe to try opening the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    
    // Set a timeout to redirect to Play Store if app isn't installed
    const timeoutId = setTimeout(() => {
      window.location.href = playStoreUrl;
    }, 2000);

    // Listen for the iframe to load, which means the app didn't open
    iframe.onload = () => {
      clearTimeout(timeoutId);
      // If we got here, app isn't installed - redirect to Play Store
      window.location.href = playStoreUrl;
    };

    // Try to open the app
    document.body.appendChild(iframe);
    iframe.src = appUrl;

    // Handle errors gracefully
    window.addEventListener('error', () => {
      clearTimeout(timeoutId);
      document.body.removeChild(iframe);
      // Stay on the web version
    });
  };

  const openAndroidApp = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      tryOpenAndroidApp();
    } else {
      toast({
        title: "Mobile App",
        description: "Download our Android app from the Play Store for the best experience!",
        variant: "default"
      });
      navigate('/download');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div 
      className="min-h-screen overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(142, 45, 226, 0.1) 0%, transparent 80%)"
      }}
    >
      {/* Hero Section */}
      <header className="flex justify-between items-center p-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gradient"
        >
          WatchTube
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <CustomButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </CustomButton>
          <CustomButton 
            variant="glow" 
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign Up
          </CustomButton>
        </motion.div>
      </header>

      <section className="container mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center">
        <motion.div 
          className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient leading-tight">
            Watch YouTube <br /> Together in <br /> Real-Time
          </h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Synchronize videos, chat with friends, and create shared playlists for the ultimate watch party experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <CustomButton 
              variant="glow" 
              size="lg"
              onClick={() => navigate('/auth')}
              icon={<Play size={20} />}
              className="subtle-glow"
            >
              Start Watching
            </CustomButton>
            <CustomButton 
              variant="outline" 
              size="lg"
              onClick={openAndroidApp}
              icon={<Download size={20} />}
            >
              Open App
            </CustomButton>
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:w-1/2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30"></div>
            <div className="relative glass-effect rounded-2xl overflow-hidden aspect-video">
              <img 
                src="/placeholder.svg" 
                alt="WatchTube Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full glass-effect flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                  <Play size={40} className="text-white ml-2" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Key Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need for the perfect synchronized viewing experience
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <GlassCard className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Play size={28} className="text-primary ml-1" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Synchronized Playback</h3>
                  <p className="text-muted-foreground mb-4">
                    Watch YouTube videos in perfect sync with your friends, with real-time playback controls.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <GlassCard className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Users size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Live Chat</h3>
                  <p className="text-muted-foreground mb-4">
                    Chat with your friends while watching videos together, sharing reactions in real-time.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <GlassCard className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Music size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Shared Playlists</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and manage playlists collaboratively with friends for marathon viewing sessions.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <motion.div 
          className="container mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying WatchTube for their synchronized viewing sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CustomButton 
              variant="glow" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="px-10"
            >
              Sign Up Now
            </CustomButton>
            <CustomButton 
              variant="outline" 
              size="lg"
              onClick={openAndroidApp}
              className="px-10"
            >
              Open App
            </CustomButton>
          </div>
        </motion.div>
      </section>

      <section className="py-12 bg-background/30">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gradient">Connect With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow us on social media or join our community
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <GlassCard className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-3">Telegram</h3>
                <p className="text-muted-foreground mb-4">
                  Join our Telegram community for updates and support
                </p>
                <CustomButton 
                  variant="outline"
                  onClick={() => window.open('https://t.me/WatchTubeFun', '_blank')}
                >
                  @WatchTubeFun
                </CustomButton>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <GlassCard className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-3">Instagram</h3>
                <p className="text-muted-foreground mb-4">
                  Follow us on Instagram for latest news
                </p>
                <CustomButton 
                  variant="outline"
                  onClick={() => window.open('https://instagram.com/watchtube.fun', '_blank')}
                >
                  @watchtube.fun
                </CustomButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <footer className="bg-background/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gradient mb-2">WatchTube</h2>
              <p className="text-muted-foreground">Watch together, anytime, anywhere.</p>
            </div>
            <div className="flex gap-6">
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/download" className="text-muted-foreground hover:text-foreground transition-colors">
                Download
              </a>
              <a href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} WatchTube.com. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Developer & Founder: <a href="https://instagram.com/jitusarkar21" target="_blank" rel="noopener noreferrer" className="hover:underline">@jitusarkar21</a> | Contact: cozmoim@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
