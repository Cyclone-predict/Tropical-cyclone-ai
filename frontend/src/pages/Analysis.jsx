import React, { useState, useRef } from 'react';
import { UploadCloud, X, Zap, CheckCircle2, AlertTriangle, Info, Scan, Crosshair } from 'lucide-react';
import { predictSatelliteImage } from '../services/api';
import SatelliteViewer from '../components/SatelliteViewer';

const DEMO_HEATMAP = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000";

const Analysis = ({ isDemoMode }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
      } else {
        setError("Please drop a valid image file.");
      }
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 2000));
        setResult({
          cyclone_detected: true,
          pattern: 'Curved Band Pattern',
          confidence: 0.92,
          trend: 'Intensifying',
          explanation: 'Dense convective banding observed spiraling into a defined center. Characteristic of a developing tropical cyclone.',
          heatmap_url: DEMO_HEATMAP
        });
      } else {
        const response = await predictSatelliteImage(selectedImage);
        setResult(response);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze image. Backend API unreachable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-primary">Satellite Analysis</h1>
        <h2 className="text-purple font-mono uppercase text-sm tracking-widest mt-1 flex items-center gap-2">
          <Scan size={14} /> Feature Extraction & AI Classification
        </h2>
      </div>

      <div className="dashboard-grid flex-1">
        {/* Upload Column */}
        <div className="col-span-12 lg:col-span-5">
          <div className="panel p-6 h-full flex flex-col border-t-2 border-t-purple">
            <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-widest mb-6">Input Imagery</h3>
            
            {!imagePreview ? (
              <div 
                className="flex-1 border border-dashed border-border-color rounded-md flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-purple hover:bg-purple-light transition-all bg-canvas relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="absolute inset-0 bg-purple-light/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center mb-4 border border-subtle relative z-10">
                   <UploadCloud size={30} className="text-purple" />
                </div>
                <p className="font-mono font-bold text-primary mb-1 relative z-10">SELECT OR DROP IMAGE</p>
                <p className="text-xs text-muted font-mono uppercase tracking-wider relative z-10">JPG, PNG, TIFF &bull; Max 10MB</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="relative rounded-md overflow-hidden border border-subtle bg-zinc-950 flex-1 min-h-[300px]">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[4px] border-zinc-950/50"></div>
                  
                  {/* Tech crosshairs */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 text-purple pointer-events-none">
                     <Crosshair size={48} strokeWidth={1} />
                  </div>

                  <button 
                    className="absolute top-3 right-3 bg-zinc-900/80 hover:bg-danger hover:text-white text-secondary p-1.5 rounded backdrop-blur transition-all border border-subtle hover:border-danger"
                    onClick={clearSelection}
                    disabled={isAnalyzing}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <button 
                  className="btn btn-primary w-full py-3 font-mono uppercase tracking-wider"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Executing Neural Analysis...
                    </>
                  ) : (
                    <>
                      <Zap size={18} /> Run AI Inference
                    </>
                  )}
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-mono uppercase flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="col-span-12 lg:col-span-7">
          <div className="panel p-6 h-full flex flex-col min-h-[600px] border-t-2 border-t-purple relative overflow-hidden group">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
            )}
            
            <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-widest mb-6">Model Output</h3>
            
            {!result && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-muted border border-dashed border-subtle rounded-md bg-canvas">
                <Info size={32} className="mb-3 opacity-20" />
                <p className="font-mono text-xs uppercase tracking-wider">Awaiting input for analysis</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-muted border border-subtle rounded-md bg-canvas relative overflow-hidden">
                <div className="absolute left-0 w-full h-[100px] bg-purple-light/40 animate-[translate-y-full_2s_infinite] blur-md pointer-events-none"></div>
                <div className="w-12 h-12 border-2 border-purple/20 border-t-purple rounded-full animate-spin mb-4 shadow-glow"></div>
                <p className="font-mono text-purple animate-pulse font-bold tracking-widest uppercase">Processing Telemetry...</p>
                <p className="text-xs mt-2 text-secondary font-mono text-center px-4">Extracting spatial features & generating heatmaps.</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="flex-1 flex flex-col animate-fade-in relative z-10">
                <div className="flex items-center gap-4 mb-6 p-4 rounded-md border border-subtle bg-canvas">
                  <div className={`p-2 rounded ${result.cyclone_detected ? 'bg-danger/10 text-danger border border-danger/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-success/10 text-success border border-success/30'}`}>
                     <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary uppercase tracking-tight">
                      {result.cyclone_detected ? 'Cyclone Pattern Confirmed' : 'No Cyclone Structure'}
                    </h4>
                    {result.confidence && (
                      <p className="text-xs font-mono text-purple mt-1 tracking-wider">CONF: {(result.confidence > 1 ? result.confidence : result.confidence * 100).toFixed(1)}%</p>
                    )}
                  </div>
                </div>

                {result.cyclone_detected && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-canvas p-4 rounded-md border border-subtle border-l-2 border-l-purple">
                      <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1">Structure Pattern</p>
                      <p className="text-lg font-bold text-primary">{result.pattern}</p>
                    </div>
                    <div className="bg-canvas p-4 rounded-md border border-subtle border-l-2 border-l-purple">
                      <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1">Intensity Vector</p>
                      <p className="text-lg font-bold text-primary">{result.trend}</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple rounded-sm shadow-glow"></div>
                    <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-widest">Explainable AI (XAI) Overlay</h4>
                  </div>
                  
                  {result.heatmap_url ? (
                     <div className="flex-1 min-h-[300px] border border-subtle rounded-md overflow-hidden bg-zinc-950">
                       <SatelliteViewer 
                         imageSrc={imagePreview}
                         explainabilitySrc={result.heatmap_url}
                         isLoading={false}
                       />
                     </div>
                  ) : (
                    <div className="bg-canvas p-6 rounded-md border border-dashed border-subtle text-xs font-mono text-secondary flex-1 flex flex-col justify-center items-center text-center">
                      {result.explanation ? (
                        <p className="max-w-md">{result.explanation}</p>
                      ) : (
                        <>
                          <Info size={24} className="mb-2 opacity-30" />
                          <p>Explainability heatmap unavailable.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
