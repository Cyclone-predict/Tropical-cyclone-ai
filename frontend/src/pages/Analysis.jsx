import React, { useState, useRef } from 'react';
import { UploadCloud, X, Zap, AlertTriangle, Info, Scan, Crosshair } from 'lucide-react';
import { predictSatelliteImage } from '../services/api';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const isTcirFile = (file) => /\.(h5|hdf5)$/i.test(file.name);

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isTcirFile(file)) {
      setError("Select a TCIR .h5 or .hdf5 file with four satellite channels.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The TCIR file must be 25 MB or smaller.");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isTcirFile(file) && file.size <= MAX_FILE_SIZE) {
        setSelectedFile(file);
        setResult(null);
        setError(null);
      } else if (!isTcirFile(file)) {
        setError("Select a TCIR .h5 or .hdf5 file with four satellite channels.");
      } else {
        setError("The TCIR file must be 25 MB or smaller.");
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await predictSatelliteImage(selectedFile);
      setResult(response);
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
          <Scan size={14} /> TCIR HDF5 Intensity Pipeline
        </h2>
      </div>

      <div className="dashboard-grid flex-1">
        {/* Upload Column */}
        <div className="col-span-12 lg:col-span-5">
          <div className="panel p-6 h-full flex flex-col border-t-2 border-t-purple">
            <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-widest mb-6">Input Imagery</h3>
            
            {!selectedFile ? (
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
                <p className="font-mono font-bold text-primary mb-1 relative z-10">SELECT OR DROP TCIR FILE</p>
                <p className="text-xs text-muted font-mono uppercase tracking-wider relative z-10">HDF5 with IR, WV, VIS &amp; PMW channels &bull; Max 25MB</p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".h5,.hdf5,application/x-hdf5" onChange={handleFileSelect} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="relative flex-1 min-h-[180px] rounded-md border border-subtle bg-canvas flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <Crosshair size={36} strokeWidth={1.5} className="text-purple" />
                  <div>
                    <p className="font-mono font-bold text-primary break-all">{selectedFile.name}</p>
                    <p className="text-xs text-muted font-mono mt-2">TCIR HDF5 &bull; {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
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
                      <Zap size={18} /> Run Prototype Inference
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
                <p className="text-xs mt-2 text-secondary font-mono text-center px-4">Reading the TCIR matrix and running prototype intensity inference.</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="flex-1 flex flex-col animate-fade-in relative z-10">
                <div className="mb-6 p-4 rounded-md border border-subtle bg-canvas">
                  <h4 className="text-lg font-bold text-primary uppercase tracking-tight">Prototype inference result</h4>
                  <p className="text-xs font-mono text-secondary mt-1">Pipeline validation only; not a validated forecast.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {result.pattern != null && (
                    <div className="bg-canvas p-4 rounded-md border border-subtle border-l-2 border-l-purple">
                      <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1">Prototype category</p>
                      <p className="text-lg font-bold text-primary">{result.pattern}</p>
                    </div>
                  )}
                  {result.predicted_vmax != null && (
                    <div className="bg-canvas p-4 rounded-md border border-subtle border-l-2 border-l-purple">
                      <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1">Prototype Vmax (knots)</p>
                      <p className="text-lg font-bold text-primary">{result.predicted_vmax}</p>
                    </div>
                )}
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple rounded-sm shadow-glow"></div>
                    <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-widest">Pipeline note</h4>
                  </div>
                  
                  <div className="bg-canvas p-6 rounded-md border border-dashed border-subtle text-xs font-mono text-secondary flex-1 flex flex-col justify-center items-center text-center">
                    <Info size={24} className="mb-2 opacity-30" />
                    <p>{result.note || "Pipeline validation output; not a scientifically validated forecast."}</p>
                  </div>
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
