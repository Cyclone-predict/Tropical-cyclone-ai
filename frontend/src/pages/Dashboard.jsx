import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import CycloneCard from '../components/CycloneCard';
import PredictionPanel from '../components/PredictionPanel';
import SatelliteViewer from '../components/SatelliteViewer';
import { getCyclones, getCyclonePrediction } from '../services/api';
import { AlertCircle, UploadCloud, Activity, Map as MapIcon, ChevronRight, Cpu, Radio, Network } from 'lucide-react';

const DEMO_CYCLONE = {
  id: 'C-2026-04',
  name: 'Cyclone Amphan-II',
  status: 'Active',
  pattern: 'Eye Pattern (CDO)',
  confidence: 0.94,
  trend: 'Intensifying',
  location: { lat: 14.5, lon: 86.2 },
  timestamp: new Date().toISOString(),
};

const DEMO_PREDICTION = {
  pattern: 'Super Cyclonic Storm',
  confidence: 0.89,
  uncertainty: '5%',
  intensity_forecast: 'Rapidly Intensifying',
  next_stage: 'Category 4 Equivalent',
  predicted_track: [
    { lat: 15.2, lon: 85.8, timestamp: new Date(Date.now() + 86400000).toISOString(), stage: 'Category 3' },
    { lat: 16.5, lon: 85.1, timestamp: new Date(Date.now() + 172800000).toISOString(), stage: 'Category 4' },
    { lat: 18.0, lon: 84.5, timestamp: new Date(Date.now() + 259200000).toISOString(), stage: 'Category 4' },
  ]
};

const DEMO_HISTORY = [
  { lat: 11.2, lon: 88.5, timestamp: new Date(Date.now() - 259200000).toISOString(), intensity: 'Depression' },
  { lat: 12.5, lon: 87.8, timestamp: new Date(Date.now() - 172800000).toISOString(), intensity: 'Cyclonic Storm' },
  { lat: 13.5, lon: 87.0, timestamp: new Date(Date.now() - 86400000).toISOString(), intensity: 'Severe Cyclonic Storm' },
];

const DEMO_IMAGE = "https://images.unsplash.com/photo-1594156596782-656c93e4d504?auto=format&fit=crop&q=80&w=1000";

const Dashboard = ({ isDemoMode, navigateTo }) => {
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (isDemoMode) {
          await new Promise(r => setTimeout(r, 800));
          setData(DEMO_CYCLONE);
          setPrediction(DEMO_PREDICTION);
        } else {
          const cyclones = await getCyclones();
          if (cyclones && cyclones.length > 0) {
            const latest = cyclones[0];
            setData(latest);
            const pred = await getCyclonePrediction(latest.id);
            setPrediction(pred);
          } else {
            setData(null);
            setPrediction(null);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to fetch data from backend. Backend API unreachable.");
        setData(null);
        setPrediction(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [isDemoMode]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Dashboard Hero */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-primary">CycloneAI Labs</h1>
          <h2 className="text-purple font-mono uppercase text-sm tracking-widest mt-1 flex items-center gap-2">
            <Activity size={14} /> Tropical Cyclone Intelligence
          </h2>
          <p className="text-secondary text-sm mt-2 max-w-lg">
            AI-powered satellite analysis and multi-source cyclone monitoring system.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-subtle px-4 py-2 rounded-lg shadow-sm">
          <div className="status-dot-animated"></div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">System Online</span>
          <span className="text-muted text-xs border-l border-subtle pl-3 ml-1">
            {new Date().toISOString().substring(0, 10)} {new Date().toISOString().substring(11, 16)} UTC
          </span>
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="telemetry-strip shadow-sm">
        <div className="telemetry-item">
          <Cpu size={14} className="text-purple" />
          <span>MODEL:</span>
          <span className="telemetry-value text-success">READY</span>
        </div>
        <div className="telemetry-item">
          <Radio size={14} className="text-purple" />
          <span>SATELLITE:</span>
          <span className="telemetry-value text-success">CONNECTED</span>
        </div>
        <div className="telemetry-item">
          <Network size={14} className="text-purple" />
          <span>API MODE:</span>
          <span className={`telemetry-value ${isDemoMode ? 'text-warning' : 'text-success'}`}>
            {isDemoMode ? 'DEMO INJECTED' : 'LIVE'}
          </span>
        </div>
        {isLoading && (
          <div className="telemetry-item ml-auto">
            <span className="animate-pulse text-purple font-semibold">SYNCING DATA...</span>
          </div>
        )}
      </div>

      {error && !isDemoMode && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-lg flex items-start gap-3 mb-6 font-mono text-sm shadow-sm">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">Connection Error</span>
            <span className="opacity-90">{error}</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid flex-1">
        
        {/* CENTERPIECE: Map */}
        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[500px]">
          <div className="panel flex-1 flex flex-col p-1">
            <div className="flex-1 relative rounded-md overflow-hidden bg-zinc-950">
              <Map 
                currentLocation={data?.location}
                historicalTrack={isDemoMode ? DEMO_HISTORY : (data?.history || [])}
                predictedTrack={prediction?.predicted_track || []}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <CycloneCard data={data} isLoading={isLoading} />
          <PredictionPanel prediction={prediction} isLoading={isLoading} />
          
          {/* Quick Actions */}
          <div className="panel p-5">
            <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest mb-4">Command Actions</h3>
            <div className="flex flex-col gap-2">
              <button 
                className="btn btn-primary justify-between w-full shadow-sm"
                onClick={() => navigateTo('analysis')}
              >
                <span className="flex items-center gap-2"><UploadCloud size={16} /> ANALYZE SATELLITE</span>
                <ChevronRight size={16} />
              </button>
              <button 
                className="btn btn-secondary justify-between w-full"
                onClick={() => navigateTo('map')}
              >
                <span className="flex items-center gap-2 text-primary"><MapIcon size={16} /> VIEW FULL TRACK</span>
                <ChevronRight size={16} className="text-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
