
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogToastProps {
  message: string;
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

const LogToast = ({ message, duration = 1000, visible, onHide }: LogToastProps) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-md shadow-lg border border-white/10">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogToast;
