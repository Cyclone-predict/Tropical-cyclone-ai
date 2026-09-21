import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import { getCyclones, getCyclonePrediction } from '../services/api';
import { Map as MapIcon, Layers, Radio } from 'lucide-react';

const DEMO_LOCATION = { lat: 14.5, lon: 86.2, timestamp: new Date().toISOString() };
const DEMO_HISTORY = [
  { lat: 11.2, lon: 88.5, timestamp: new Date(Date.now() - 259200000).toISOString(), intensity: 'Depression' },
  { lat: 12.5, lon: 87.8, timestamp: new Date(Date.now() - 172800000).toISOString(), intensity: 'Cyclonic Storm' },
  { lat: 13.5, lon: 87.0, timestamp: new Date(Date.now() - 86400000).toISOString(), intensity: 'Severe Cyclonic Storm' },
];
const DEMO_PREDICTED = [
  { lat: 15.2, lon: 85.8, timestamp: new Date(Date.now() + 86400000).toISOString(), stage: 'Category 3' },
  { lat: 16.5, lon: 85.1, timestamp: new Date(Date.now() + 172800000).toISOString(), stage: 'Category 4' },
  { lat: 18.0, lon: 84.5, timestamp: new Date(Date.now() + 259200000).toISOString(), stage: 'Category 4' },
];

const MapPage = ({ isDemoMode }) => {
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
          await new Promise(r => setTimeout(r, 600));
          setMapData({
            currentLocation: DEMO_LOCATION,
            historicalTrack: DEMO_HISTORY,
            predictedTrack: DEMO_PREDICTED
          });
        } else {
          const cyclones = await getCyclones();
          if (cyclones && cyclones.length > 0) {
            const active = cyclones[0];
            const prediction = await getCyclonePrediction(active.id);
            
            setMapData({
              currentLocation: active.location,
              historicalTrack: active.history || [],
              predictedTrack: prediction?.predicted_track || []
            });
          } else {
            setMapData(null);
          }
        }
      } catch (err) {
        console.error("Map fetch error:", err);
        setMapData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMapData();
  }, [isDemoMode]);

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-primary flex items-center gap-2">
            <MapIcon size={24} className="text-purple" /> Interactive Tracking
          </h1>
          <h2 className="text-muted font-mono uppercase text-[10px] tracking-widest mt-1">
            Geospatial projection of historical paths and AI trajectory models
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-surface border border-subtle px-3 py-1.5 rounded text-[10px] font-mono text-muted uppercase">
             <Radio size={12} className={isLoading ? "text-warning animate-pulse" : "text-success"} />
             {isLoading ? 'SYNCING DATA' : 'FEED ACTIVE'}
          </div>
          <button className="btn btn-secondary text-xs font-mono uppercase px-3 py-1.5">
            <Layers size={14} /> Layers
          </button>
        </div>
      </div>
      
      <div className="flex-1 panel p-1 flex flex-col shadow-md border-t-2 border-t-purple relative overflow-hidden">
        {/* Subtle crosshairs behind map container */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-purple/10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-purple/10 pointer-events-none"></div>
        
        <div className="flex-1 rounded-sm overflow-hidden relative border border-subtle bg-zinc-950">
          <Map 
            currentLocation={mapData?.currentLocation}
            historicalTrack={mapData?.historicalTrack}
            predictedTrack={mapData?.predictedTrack}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
