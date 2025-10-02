export interface VideoProgress {
    videoId: string;
    isCompleted: boolean;
    watchedPercentage: number;
    lastWatchedAt: string;
  }
  
  const STORAGE_KEY = 'bootcamp_video_progress';
  
  export const getVideoProgress = (): Record<string, VideoProgress> => {
    if (typeof window === 'undefined') return {};
    
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };
  
  export const saveVideoProgress = (progress: Record<string, VideoProgress>) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  };
  
  export const markVideoComplete = (videoId: string) => {
    const progress = getVideoProgress();
    progress[videoId] = {
      videoId,
      isCompleted: true,
      watchedPercentage: 100,
      lastWatchedAt: new Date().toISOString()
    };
    saveVideoProgress(progress);
  };
  
  export const updateVideoProgress = (videoId: string, percentage: number) => {
    const progress = getVideoProgress();
    progress[videoId] = {
      videoId,
      isCompleted: percentage >= 80, 
      watchedPercentage: percentage,
      lastWatchedAt: new Date().toISOString()
    };
    saveVideoProgress(progress);
  };

  console.log(getVideoProgress());
  
  export const isVideoCompleted = (videoId: string): boolean => {
    const progress = getVideoProgress();
    return progress[videoId]?.isCompleted || false;
  };