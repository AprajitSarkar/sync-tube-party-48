
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center subtle-glow"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            >
              <Play size={36} className="text-accent ml-2" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-accent/10 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1.8],
                opacity: [0.3, 0.1, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeOut"
              }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold mb-2 text-gradient"
        >
          Sync Tube Party
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-muted-foreground"
        >
          Watch YouTube videos together
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
