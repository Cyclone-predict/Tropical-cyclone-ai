import React, { useState, useEffect } from 'react';
import EvolutionTimeline from '../components/EvolutionTimeline';
import { getCyclones, getCycloneHistory } from '../services/api';
import { History } from 'lucide-react';

const DEMO_OBSERVATIONS = [
  { timestamp: new Date(Date.now() - 345600000).toISOString(), confidence: 0.45, pattern: 'Low Pressure Area', location: { lat: 10.1, lon: 89.2 } },
  { timestamp: new Date(Date.now() - 259200000).toISOString(), confidence: 0.65, pattern: 'Depression', location: { lat: 11.2, lon: 88.5 } },
  { timestamp: new Date(Date.now() - 172800000).toISOString(), confidence: 0.78, pattern: 'Cyclonic Storm', location: { lat: 12.5, lon: 87.8 } },
  { timestamp: new Date(Date.now() - 86400000).toISOString(), confidence: 0.88, pattern: 'Severe Cyclonic Storm', location: { lat: 13.5, lon: 87.0 } },
  { timestamp: new Date().toISOString(), confidence: 0.94, pattern: 'Eye Pattern (CDO)', location: { lat: 14.5, lon: 86.2 } },
];

const Evolution = ({ isDemoMode }) => {
  const [observations, setObservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
          await new Promise(r => setTimeout(r, 600));
          setObservations(DEMO_OBSERVATIONS);
        } else {
          const cyclones = await getCyclones();
          if (cyclones && cyclones.length > 0) {
            const active = cyclones[0];
            const history = await getCycloneHistory(active.id);
            
            const fullHistory = history ? [...history] : [];
            if (active.timestamp) {
               fullHistory.push({
                 timestamp: active.timestamp,
                 confidence: active.confidence,
                 pattern: active.pattern,
                 location: active.location
               });
            }
            setObservations(fullHistory);
          } else {
            setObservations([]);
          }
        }
      } catch (err) {
        console.error("Evolution fetch error:", err);
        setObservations([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [isDemoMode]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-3">
          <div className="p-2 bg-purple-light text-purple rounded-lg">
             <History size={24} />
          </div>
          System History & Evolution
        </h1>
        <p className="page-subtitle mt-2">Chronological analysis of AI confidence and structural pattern progression.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="col-span-12 lg:col-span-10 lg:col-start-2">
          <EvolutionTimeline observations={observations} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Evolution;
