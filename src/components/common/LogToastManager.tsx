
import React, { useState, useEffect, createContext, useContext } from 'react';
import LogToast from './LogToast';

interface LogToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const LogToastContext = createContext<LogToastContextType | null>(null);

export const useLogToast = () => {
  const context = useContext(LogToastContext);
  if (!context) {
    throw new Error('useLogToast must be used within a LogToastProvider');
  }
  return context;
};

interface LogToastProviderProps {
  children: React.ReactNode;
}

export const LogToastProvider = ({ children }: LogToastProviderProps) => {
  const [toastMessage, setToastMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [toastDuration, setToastDuration] = useState(1000);

  const showToast = (message: string, duration = 1000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setIsVisible(true);
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  return (
    <LogToastContext.Provider value={{ showToast }}>
      {children}
      <LogToast 
        message={toastMessage} 
        visible={isVisible} 
        onHide={hideToast}
        duration={toastDuration}
      />
    </LogToastContext.Provider>
  );
};
