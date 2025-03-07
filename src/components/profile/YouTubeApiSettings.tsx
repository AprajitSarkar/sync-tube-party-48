
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { AlertCircle, Save, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type YouTubeApiSettingsProps = {
  userId: string | undefined;
};

const YouTubeApiSettings: React.FC<YouTubeApiSettingsProps> = ({ userId }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load saved API key from localStorage on component mount
  useEffect(() => {
    if (userId) {
      const storedKey = localStorage.getItem(`youtube_api_key_${userId}`);
      if (storedKey) {
        setSavedKey(storedKey);
        setApiKey(storedKey);
      }
    }
  }, [userId]);

  const saveApiKey = () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      // Save to localStorage (in a real app, you might want to encrypt this or store it on the server)
      localStorage.setItem(`youtube_api_key_${userId}`, apiKey);
      setSavedKey(apiKey);
      
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

  return (
    <div className="rounded-lg p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full glass-effect flex items-center justify-center">
          <Key className="text-muted-foreground" size={24} />
        </div>
        
        <div className="flex-grow">
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
            
            <div className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                Your API key is stored locally on your device. To get a YouTube Data API key, 
                visit the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Google Developer Console
                </a>.
              </span>
            </div>
            
            <CustomButton
              variant="outline"
              onClick={saveApiKey}
              isLoading={isLoading}
              disabled={!apiKey || apiKey === savedKey}
              icon={<Save size={16} />}
            >
              Save API Key
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeApiSettings;
