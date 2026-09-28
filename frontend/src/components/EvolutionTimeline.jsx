import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { Activity } from 'lucide-react';

const EvolutionTimeline = ({ observations = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="panel p-6 animate-pulse h-[400px] flex items-center justify-center border-t-2 border-t-purple">
        <p className="font-mono text-purple uppercase text-sm tracking-widest animate-pulse">Fetching timeline data...</p>
      </div>
    );
  }

  if (!observations || observations.length === 0) {
    return (
      <div className="panel p-6 h-[400px] flex flex-col items-center justify-center text-muted border-t-2 border-t-purple">
        <Activity size={32} className="mb-3 opacity-20" />
        <p className="font-mono text-xs uppercase tracking-wider">No historical observations available</p>
      </div>
    );
  }

  const chartData = observations.map(obs => {
    const date = new Date(obs.timestamp);
    return {
      timeLabel: `${date.getHours().toString().padStart(2, '0')}:00`,
      dateLabel: `${date.getDate()}/${date.getMonth()+1}`,
      rawDate: obs.timestamp,
      confidence: obs.confidence ? (obs.confidence > 1 ? obs.confidence : obs.confidence * 100) : null,
      pattern: obs.pattern,
    };
  }).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 backdrop-blur border border-purple/30 p-3 rounded shadow-glow text-primary z-50">
          <p className="font-mono text-[10px] text-muted mb-2 border-b border-subtle pb-1 uppercase">{payload[0]?.payload?.dateLabel} {label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-4 mb-1">
              <span className="font-mono text-xs text-muted uppercase">CONF</span>
              <span className="font-mono text-sm text-purple font-bold">
                {entry.value?.toFixed(1)}%
              </span>
            </div>
          ))}
          {payload[0]?.payload?.pattern && (
            <div className="mt-2 text-[10px] font-mono">
              <span className="text-muted block mb-0.5">PATTERN</span>
              <span className="text-primary font-bold">{payload[0].payload.pattern}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="panel p-6 border-t-2 border-t-purple">
      <div className="flex items-center justify-between mb-6 border-b border-subtle pb-4">
        <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-purple" /> Confidence Telemetry
        </h3>
        <div className="text-[10px] font-mono text-purple border border-purple/30 px-2 py-0.5 rounded bg-purple-light">LIVE</div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            {/* Minimal tech grid */}
            <CartesianGrid strokeDasharray="2 4" stroke="#71717A" opacity={0.15} vertical={false} />
            <XAxis 
              dataKey="timeLabel" 
              stroke="#71717A" 
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#71717A" 
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#A855F7', strokeWidth: 1, strokeDasharray: '4 4' }}/>
            <Area 
              type="monotone" 
              dataKey="confidence" 
              stroke="#A855F7" 
              strokeWidth={2}
              fill="url(#colorConfidence)" 
              activeDot={{ r: 4, fill: '#A855F7', stroke: '#09090B', strokeWidth: 2, className: "shadow-glow" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-5 border-t border-subtle">
        <h4 className="text-xs font-mono font-bold text-muted uppercase tracking-widest mb-4">Event Log</h4>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {[...observations].reverse().map((obs, i) => (
            <div key={i} className="flex gap-4 items-start relative pb-4 border-b border-subtle last:border-0 last:pb-0 group">
              <div className="font-mono text-[10px] text-muted whitespace-nowrap mt-1 group-hover:text-purple transition-colors w-16">
                {new Date(obs.timestamp).getHours().toString().padStart(2, '0')}:{new Date(obs.timestamp).getMinutes().toString().padStart(2, '0')}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border-color mt-1.5 group-hover:bg-purple group-hover:shadow-glow transition-all"></div>
              <div className="flex-1">
                <div className="font-mono text-[11px] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="text-primary">{obs.pattern || 'Unknown Event'}</span>
                  {obs.confidence && (
                     <span className="text-purple font-bold">{(obs.confidence > 1 ? obs.confidence : obs.confidence * 100).toFixed(1)}%</span>
                  )}
                </div>
                {obs.location && (
                  <div className="font-mono text-[10px] text-muted uppercase">
                    Lat {obs.location.lat.toFixed(2)} &bull; Lon {obs.location.lon.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvolutionTimeline;
