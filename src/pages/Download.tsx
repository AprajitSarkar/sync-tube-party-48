
import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download as DownloadIcon, Apple, Smartphone, Globe as GlobeIcon } from 'lucide-react';

const DownloadPage = () => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-background p-4 md:p-8"
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(142, 45, 226, 0.08) 0%, transparent 70%)"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="mb-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Download SyncTube Party</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch YouTube videos together with friends in real-time, sync playback, and chat while watching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="p-6 h-full flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-full bg-white/5">
                <Apple className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">iOS App</h2>
              <p className="text-muted-foreground mb-6 flex-grow">
                Download our iOS app from the App Store to enjoy SyncTube Party on your iPhone or iPad.
              </p>
              <CustomButton variant="glow" className="w-full" icon={<DownloadIcon size={18} />}>
                Download for iOS
              </CustomButton>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="p-6 h-full flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-full bg-white/5">
                <Smartphone className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Android App</h2>
              <p className="text-muted-foreground mb-6 flex-grow">
                Download our Android app from the Google Play Store for the best mobile experience.
              </p>
              <CustomButton variant="glow" className="w-full" icon={<DownloadIcon size={18} />}>
                Download for Android
              </CustomButton>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="p-6 h-full flex flex-col items-center text-center">
              <div className="mb-4 p-4 rounded-full bg-white/5">
                <GlobeIcon className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Web App</h2>
              <p className="text-muted-foreground mb-6 flex-grow">
                No download required! Use SyncTube Party directly in your browser on any device.
              </p>
              <Link to="/home" className="w-full">
                <CustomButton variant="glow" className="w-full">
                  Launch Web App
                </CustomButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            By downloading or using our app, you agree to our
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DownloadPage;
