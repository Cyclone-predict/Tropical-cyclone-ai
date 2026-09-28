import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Futuristic Icons (using CSS filters defined via classNames)
const currentIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  className: 'hue-rotate-[270deg] saturate-200' // Purple tint
});

const predictedIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowUrl: markerShadow,
  shadowSize: [32, 32],
  className: 'hue-rotate-[0deg] saturate-200 opacity-80' // Red/Orange tint
});

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

const Map = ({ 
  currentLocation, 
  historicalTrack = [], 
  predictedTrack = [],
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 absolute inset-0 z-50">
        <div className="w-12 h-12 border-2 border-purple/20 border-t-purple rounded-full animate-spin mb-4 shadow-glow"></div>
        <p className="text-purple font-mono text-sm tracking-widest animate-pulse uppercase">Initializing geospatial data...</p>
      </div>
    );
  }

  const defaultCenter = [15.0, 85.0];
  const center = currentLocation ? [currentLocation.lat, currentLocation.lon] : defaultCenter;
  
  const historyCoords = historicalTrack.map(pt => [pt.lat, pt.lon]);
  const predictedCoords = predictedTrack.map(pt => [pt.lat, pt.lon]);

  if (currentLocation && historyCoords.length > 0) {
    historyCoords.push([currentLocation.lat, currentLocation.lon]);
  }
  
  if (currentLocation && predictedCoords.length > 0) {
    predictedCoords.unshift([currentLocation.lat, currentLocation.lon]);
  }

  return (
    <div className="w-full h-full relative flex flex-col">
      {/* FUTURISTIC MAP OVERLAYS */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-zinc-950/80 backdrop-blur-md border border-purple/30 px-3 py-2 rounded shadow-glow text-white">
          <div className="font-mono text-[10px] text-purple uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Crosshair size={12} /> Live Tracking
          </div>
          <div className="font-mono text-xs">
            {new Date().toISOString().substring(0, 10)} &bull; {new Date().toISOString().substring(11, 16)} UTC
          </div>
        </div>
      </div>

      {currentLocation && (
        <div className="absolute bottom-6 left-4 z-[1000] pointer-events-none">
          <div className="bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded text-white font-mono text-xs flex items-start gap-3">
            <MapPin size={16} className="text-purple mt-0.5" />
            <div>
              <div className="text-purple/80 text-[10px] uppercase mb-0.5 tracking-wider">Target Center</div>
              <div>LAT {currentLocation.lat.toFixed(2)}&deg; &bull; LON {currentLocation.lon.toFixed(2)}&deg;</div>
            </div>
          </div>
        </div>
      )}

      {/* ACTUAL LEAFLET MAP */}
      <div className="flex-1 w-full relative z-[1]">
        <MapContainer 
          center={center} 
          zoom={5} 
          style={{ height: '100%', width: '100%', background: '#09090b', position: 'absolute', inset: 0 }}
          scrollWheelZoom={true}
        >
          <MapUpdater center={center} zoom={5} />
          {/* CartoDB Dark Matter Base Map */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Tracks */}
          {historyCoords.length > 0 && (
            <Polyline positions={historyCoords} color="#A855F7" weight={3} dashArray="4, 6" opacity={0.6} />
          )}

          {predictedCoords.length > 0 && (
            <Polyline positions={predictedCoords} color="#F59E0B" weight={2} opacity={0.8} />
          )}

          {/* Markers */}
          {historicalTrack.map((pt, idx) => (
            <Marker key={`hist-${idx}`} position={[pt.lat, pt.lon]} opacity={0.4}>
              <Popup className="tech-popup">
                <div className="font-mono text-xs">
                  <span className="text-purple block mb-1">HISTORICAL</span>
                  {pt.lat.toFixed(2)}, {pt.lon.toFixed(2)}
                </div>
              </Popup>
            </Marker>
          ))}

          {predictedTrack.map((pt, idx) => (
            <Marker key={`pred-${idx}`} position={[pt.lat, pt.lon]} icon={predictedIcon}>
              <Popup className="tech-popup">
                <div className="font-mono text-xs">
                  <span className="text-warning block mb-1">PREDICTED</span>
                  {pt.lat.toFixed(2)}, {pt.lon.toFixed(2)}
                </div>
              </Popup>
            </Marker>
          ))}

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lon]} icon={currentIcon}>
              <Popup className="tech-popup">
                <div className="font-mono text-xs">
                  <span className="text-success block mb-1 uppercase tracking-wider">Current Fix</span>
                  {currentLocation.lat.toFixed(2)}, {currentLocation.lon.toFixed(2)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* BOTTOM LEGEND */}
      <div className="absolute bottom-6 right-4 z-[1000] pointer-events-none">
        <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 p-3 rounded text-white font-mono text-[10px] uppercase tracking-wider">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
            <span>Current Fix</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 border-t border-dashed border-purple"></div>
            <span className="opacity-70">Historical Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-warning"></div>
            <span className="text-warning/90">Model Prediction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
