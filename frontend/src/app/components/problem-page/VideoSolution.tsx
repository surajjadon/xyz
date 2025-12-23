import React from 'react';
import { Youtube, ExternalLink, AlertCircle, PlayCircle } from 'lucide-react';

interface VideoSolutionProps {
  videoUrl?: string;
}

const VideoSolutionComponent: React.FC<VideoSolutionProps> = ({ videoUrl }) => {
  
  // Helper to extract YouTube ID and create Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('embed')) return url;
    
    // Regex to handle various YouTube URL formats (watch?v=, youtu.be/, etc.)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : url; // Fallback to original URL if regex fails
  };

  const embedUrl = getEmbedUrl(videoUrl || "");

  // --- EMPTY STATE ---
  if (!videoUrl) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 bg-slate-50/50">
         <div className="p-4 bg-slate-100 rounded-full">
            <AlertCircle className="w-8 h-8 opacity-40" />
         </div>
         <div className="text-center">
            <p className="font-semibold text-slate-600">No Video Available</p>
            <p className="text-sm">There is no video solution for this problem yet.</p>
         </div>
       </div>
    );
  }

  // --- VIDEO PLAYER UI ---
  return (
    <div className="flex flex-col h-full w-full p-4 lg:p-6 overflow-y-auto custom-scrollbar">
      
      {/* Header */}

      {/* Player Container */}
      <div className="w-full bg-black rounded-xl overflow-hidden shadow-sm border border-slate-200 relative group aspect-video shrink-0">
        <iframe 
          src={embedUrl} 
          title="Video Solution"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

     
    </div>
  );
};

export default VideoSolutionComponent;