import React from 'react';
import { Target, Activity, Zap, AlertCircle } from 'lucide-react';

const PredictionPanel = ({ prediction, isLoading }) => {
  if (isLoading) {
    return (
      <div className="panel p-5 animate-pulse h-full">
        <div className="h-4 bg-border-color rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-8 bg-border-color rounded w-full"></div>
          <div className="h-8 bg-border-color rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="panel p-6 h-full flex flex-col items-center justify-center text-muted">
        <Target size={32} className="mb-3 opacity-20" />
        <p className="font-mono text-xs uppercase">No model prediction available</p>
      </div>
    );
  }

  const {
    pattern,
    confidence,
    uncertainty,
    intensity_forecast,
    next_stage
  } = prediction;

  const formatPercent = (val) => {
    if (val === undefined || val === null) return 'N/A';
    return val <= 1 && val > 0 ? `${(val * 100).toFixed(1)}%` : `${val}%`;
  };

  return (
    <div className="panel p-5 relative overflow-hidden group">
      {/* Subtle scanning line effect */}
      <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-transparent via-purple-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-y-full group-hover:translate-y-full"></div>

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Zap size={14} className="text-purple" /> AI Forecast
        </h3>
        {confidence && (
          <span className="text-[10px] font-mono bg-purple/10 text-purple border border-purple/30 px-2 py-0.5 rounded">
            CONF {formatPercent(confidence)}
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="bg-canvas border border-subtle p-4 rounded-md">
          <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Predicted Pattern</p>
          <p className="text-xl font-bold text-primary tracking-tight">{pattern || next_stage || 'Unknown'}</p>
        </div>

        {intensity_forecast && (
          <div className="flex items-center justify-between border-b border-subtle pb-3 px-1">
            <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Intensity Trend</span>
            <div className="flex items-center gap-2">
              <Activity size={14} className={intensity_forecast.includes('Intensifying') ? 'text-warning' : 'text-success'} />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">{intensity_forecast}</span>
            </div>
          </div>
        )}

        {uncertainty !== undefined && (
          <div className="pt-2">
            <div className="flex items-start gap-3">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-warning" />
              <div>
                <p className="text-[10px] font-mono text-warning uppercase mb-1">Uncertainty Margin ±{uncertainty}</p>
                <p className="text-[10px] text-muted leading-relaxed">
                  Probabilistic model outputs based on satellite analysis. Not guaranteed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionPanel;
