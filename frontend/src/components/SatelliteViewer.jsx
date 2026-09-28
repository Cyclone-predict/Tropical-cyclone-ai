import React from 'react';
import { Image as ImageIcon, Info, DownloadCloud } from 'lucide-react';

const SatelliteViewer = ({ 
  imageSrc, 
  explainabilitySrc, 
  timestamp, 
  source, 
  isLoading, 
  emptyMessage = "No satellite image available" 
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full bg-canvas flex items-center justify-center animate-pulse min-h-[300px]">
        <p className="text-muted">Loading imagery...</p>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className="w-full h-full bg-canvas flex flex-col items-center justify-center min-h-[300px] text-muted">
        <ImageIcon size={48} className="mb-4 opacity-20" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden group">
      <div className="relative w-full h-full min-h-[300px] overflow-hidden bg-zinc-950">
        <img 
          src={imageSrc} 
          alt="Satellite Observation" 
          className="w-full h-full object-cover"
        />
        
        {explainabilitySrc && (
          <img 
            src={explainabilitySrc} 
            alt="AI Explainability Heatmap" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-between items-end">
            <div>
              {source && (
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1 opacity-90">
                  <DownloadCloud size={14} /> {source}
                </p>
              )}
              {timestamp && (
                <p className="text-sm font-medium text-white/90">
                  {new Date(timestamp).toLocaleString()}
                </p>
              )}
            </div>
            {explainabilitySrc && (
              <div className="flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-white font-medium shadow-lg" title="Heatmap shows attention areas.">
                <Info size={14} className="text-purple-300" />
                <span>XAI Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteViewer;
