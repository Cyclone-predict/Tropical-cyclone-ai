import React from 'react';
import { Wind, MapPin, Clock, TrendingUp, TrendingDown, Minus, CheckCircle2 } from 'lucide-react';

const CycloneCard = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="panel p-5 animate-pulse">
        <div className="h-4 bg-border-color rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-border-color rounded w-full"></div>
          <div className="h-3 bg-border-color rounded w-5/6"></div>
          <div className="h-3 bg-border-color rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel p-6 flex flex-col items-center justify-center text-center text-muted min-h-[150px]">
        <Wind size={32} className="mb-2 opacity-30" />
        <p className="font-mono text-xs uppercase">No active system</p>
      </div>
    );
  }

  const {
    name,
    status,
    pattern,
    confidence,
    trend,
    location,
    timestamp
  } = data;

  const getTrendIcon = (trend) => {
    switch(trend?.toLowerCase()) {
      case 'intensifying': return <TrendingUp size={14} className="text-warning" />;
      case 'weakening': return <TrendingDown size={14} className="text-success" />;
      case 'steady': return <Minus size={14} className="text-muted" />;
      default: return null;
    }
  };

  const formatConfidence = (val) => {
    if (val === undefined || val === null) return 'N/A';
    if (val <= 1 && val > 0) return `${(val * 100).toFixed(1)}%`;
    return `${val}%`;
  };

  return (
    <div className="panel p-5 border-t-2 border-t-purple">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted mb-1 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-success" /> SYSTEM DETECTED
          </h3>
          <h4 className="text-2xl font-bold text-primary tracking-tight">{name || 'Unnamed System'}</h4>
        </div>
        {status && (
          <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${status.toLowerCase() === 'active' ? 'bg-danger/10 text-danger border-danger/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-canvas text-muted border-subtle'}`}>
            {status.toUpperCase()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-4">
        <div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-0.5">Pattern</p>
          <p className="font-semibold text-sm text-primary">{pattern}</p>
        </div>
        
        {confidence !== undefined && (
          <div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-0.5">AI Confidence</p>
            <p className="font-bold text-sm text-purple">{formatConfidence(confidence)}</p>
          </div>
        )}

        {trend && (
          <div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-0.5">Trend</p>
            <p className="font-semibold text-sm flex items-center gap-1.5 text-primary">
              {getTrendIcon(trend)} {trend}
            </p>
          </div>
        )}

        {location && (
          <div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-0.5">Location</p>
            <p className="font-medium text-xs flex items-center gap-1 text-primary">
              <MapPin size={12} className="text-muted" />
              {location.lat?.toFixed(2)}&deg;, {location.lon?.toFixed(2)}&deg;
            </p>
          </div>
        )}
      </div>

      {timestamp && (
        <div className="mt-4 pt-3 border-t border-subtle">
          <p className="text-[10px] font-mono flex items-center gap-1.5 text-muted uppercase">
            <Clock size={12} />
            LAST FIX: {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default CycloneCard;
