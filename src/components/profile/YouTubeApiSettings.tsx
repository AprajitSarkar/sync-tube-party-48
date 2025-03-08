
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { AlertCircle, Save, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Default YouTube API key
const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyB-qDaqVOnqVjiSIYfxJl2SZRySLjG9SR0';

type YouTubeApiSettingsProps = {
  userId: string | undefined;
};

const YouTubeApiSettings: React.FC<YouTubeApiSettingsProps> = ({ userId }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isUsingDefault, setIsUsingDefault] = useState(false);

  // Load saved API key from localStorage on component mount
  useEffect(() => {
    if (userId) {
      const storedKey = localStorage.getItem(`youtube_api_key_${userId}`);
      if (storedKey) {
        setSavedKey(storedKey);
        setApiKey(storedKey);
        setIsUsingDefault(false);
      } else {
        // If no key is saved, indicate we're using the default
        setIsUsingDefault(true);
      }
    }
  }, [userId]);

  const saveApiKey = () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem(`youtube_api_key_${userId}`, apiKey);
      setSavedKey(apiKey);
      setIsUsingDefault(false);
      
      toast({
        title: "API Key Saved",
        description: "Your YouTube API key has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error Saving API Key",
        description: "There was a problem saving your API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useDefaultKey = () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      // Remove any saved key to fall back to the default
      localStorage.removeItem(`youtube_api_key_${userId}`);
      setSavedKey(null);
      setApiKey('');
      setIsUsingDefault(true);
      
      toast({
        title: "Using Default API Key",
        description: "You are now using the default YouTube API key.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem reverting to the default API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg p-5 space-y-4">
      <div className={`flex ${isMobile ? 'flex-col items-center' : 'items-start'} gap-4`}>
        <div className="flex-shrink-0 w-12 h-12 rounded-full glass-effect flex items-center justify-center">
          <Key className="text-muted-foreground" size={24} />
        </div>
        
        <div className={`flex-grow ${isMobile ? 'w-full text-center' : ''}`}>
          <h3 className="text-xl font-semibold text-enhanced mb-2">YouTube API Key</h3>
          <p className="text-muted-foreground mb-4">
            Add your YouTube Data API key to enable advanced video search and recommendations.
          </p>
          
          <div className="space-y-4">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your YouTube Data API Key"
              className="bg-white/5 border-white/20"
            />
            
            {savedKey && (
              <div className="text-xs text-muted-foreground">
                API Key is currently set 
              </div>
            )}
            
            {isUsingDefault && (
              <div className="text-xs text-accent">
                Using default API key: {DEFAULT_YOUTUBE_API_KEY.substring(0, 6)}...
              </div>
            )}
            
            <div className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                Your API key is stored locally on your device. To get a YouTube Data API key, 
                visit the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Google Developer Console
                </a>.
              </span>
            </div>
            
            <div className={`flex gap-2 ${isMobile ? 'justify-center' : ''}`}>
              <CustomButton
                variant="outline"
                onClick={saveApiKey}
                isLoading={isLoading}
                disabled={!apiKey || apiKey === savedKey}
                icon={<Save size={16} />}
              >
                Save API Key
              </CustomButton>
              
              <CustomButton
                variant="ghost"
                onClick={useDefaultKey}
                disabled={isUsingDefault}
              >
                Use Default Key
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeApiSettings;
