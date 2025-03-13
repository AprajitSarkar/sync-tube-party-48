
import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Smartphone, ExternalLink, Download as DownloadIcon, ArrowLeft, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import { toast } from '@/hooks/use-toast';

const DownloadPage = () => {
  const tryOpenAndroidApp = () => {
    // The intent URL for the Android app
    const appUrl = 'intent://watchtube.fun/#Intent;scheme=https;package=com.multiple.cozmo;end';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.multiple.cozmo';
    
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
      toast({
        title: "App Not Found",
        description: "Redirecting to download page...",
        variant: "default"
      });
    });
  };

  const handleAndroidAction = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      tryOpenAndroidApp();
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.multiple.cozmo', '_blank');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Download WatchTube</h1>
            <p className="text-muted-foreground">
              Get WatchTube on your mobile device or desktop for the best experience
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Smartphone size={32} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 text-center">Mobile App</h2>
                  <p className="text-muted-foreground mb-6 text-center">
                    Download the WatchTube mobile app for a seamless experience on your smartphone or tablet.
                  </p>
                  <div className="mt-auto flex flex-col gap-4">
                    <CustomButton 
                      variant="glow" 
                      className="w-full" 
                      onClick={handleAndroidAction}
                    >
                      <DownloadIcon size={18} />
                      {/Android/i.test(navigator.userAgent) ? 'Open or Install App' : 'Google Play Store'}
                    </CustomButton>
                    <div className="w-full">
                      <CustomButton variant="outline" className="w-full" disabled>
                        <DownloadIcon size={18} />
                        Apple App Store (Coming Soon)
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GlassCard className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Globe size={32} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 text-center">Web App</h2>
                  <p className="text-muted-foreground mb-6 text-center">
                    Access WatchTube directly from your web browser on any device without installation.
                  </p>
                  <div className="mt-auto">
                    <Link to="/auth">
                      <CustomButton variant="default" className="w-full">
                        <ExternalLink size={18} />
                        Launch Web App
                      </CustomButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">
              By downloading or using WatchTube, you agree to our
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/terms" className="text-accent hover:underline transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-accent hover:underline transition-colors">
                Privacy Policy
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DownloadPage;
