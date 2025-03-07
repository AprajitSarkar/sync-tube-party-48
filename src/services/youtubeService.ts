
/**
 * Service to handle YouTube API interactions
 */

/**
 * Search YouTube videos using the provided API key
 * @param query The search query
 * @param apiKey The YouTube Data API key
 * @param maxResults Maximum number of results to return (default 10)
 */
export const searchYouTubeVideos = async (
  query: string, 
  apiKey: string,
  maxResults: number = 10
) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to search YouTube');
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
};

/**
 * Get a YouTube API key from local storage for the current user
 * @param userId The current user's ID
 */
export const getUserYouTubeApiKey = (userId: string | undefined): string | null => {
  if (!userId) return null;
  return localStorage.getItem(`youtube_api_key_${userId}`);
};

/**
 * Check if a YouTube API key is valid by making a test request
 * @param apiKey The YouTube Data API key to validate
 */
export const validateYouTubeApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
};
