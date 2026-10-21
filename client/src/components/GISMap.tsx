import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Address, EntrancePoint, ConnectingLine } from '../types';
import { calculateDistanceMeters } from '../utils/distance';
import { Layers, MapPin, Navigation, Compass, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Custom Map Pins for Leaflet
const createIcon = (color: string) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const activeIcon = createIcon('#16a34a'); // green
const cancelledIcon = createIcon('#dc2626'); // red
const entranceIcon = createIcon('#2563eb'); // blue
const secondaryEntranceIcon = createIcon('#f59e0b'); // amber

interface GISMapProps {
  addresses: Address[];
  selectedAddress?: Address | null;
  onSelectAddress?: (addr: Address) => void;
  interactiveMode?: 'none' | 'add_entrance' | 'draw_line';
  onEntranceAdded?: (point: EntrancePoint) => void;
  onLineCompleted?: (line: ConnectingLine) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Map Event Listener Component
const MapInteractionHandler: React.FC<{
  interactiveMode: 'none' | 'add_entrance' | 'draw_line';
  onMapClick: (lat: number, lng: number) => void;
  onMouseMove: (lat: number, lng: number) => void;
}> = ({ interactiveMode, onMapClick, onMouseMove }) => {
  useMapEvents({
    click(e) {
      if (interactiveMode !== 'none') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    mousemove(e) {
      onMouseMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const GISMap: React.FC<GISMapProps> = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  interactiveMode = 'none',
  onEntranceAdded,
  onLineCompleted,
  height = '600px',
  center = [41.2858, 69.2036],
  zoom = 14,
}) => {
  const [activeLayer, setActiveLayer] = useState<'osm' | 'topo'>('osm');
  const [showParcels, setShowParcels] = useState(true);
  const [showEntrances, setShowEntrances] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({ lat: 41.2858, lng: 69.2036 });

  // For drawing connecting line
  const [linePoints, setLinePoints] = useState<[number, number][]>([]);
  const [currentLineDistance, setCurrentLineDistance] = useState<number>(0);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  // When interactiveMode changes or resets
  useEffect(() => {
    setLinePoints([]);
    setCurrentLineDistance(0);
    setDistanceError(null);
  }, [interactiveMode]);

  const handleMapClick = (lat: number, lng: number) => {
    if (interactiveMode === 'add_entrance') {
      const newPoint: EntrancePoint = {
        id: `ep-${Date.now()}`,
        type: 'main',
        lat,
        lng,
        name: 'Asosiy kirish eshigi',
        isOnBoundary: true,
      };
      if (onEntranceAdded) onEntranceAdded(newPoint);
    } else if (interactiveMode === 'draw_line') {
      const nextPoints: [number, number][] = [...linePoints, [lat, lng]];
      setLinePoints(nextPoints);

      if (nextPoints.length === 2) {
        const dist = calculateDistanceMeters(
          nextPoints[0][0],
          nextPoints[0][1],
          nextPoints[1][0],
          nextPoints[1][1]
        );
        setCurrentLineDistance(dist);

        if (dist > 50) {
          setDistanceError(`TTZ 4.2.11 talabi buzildi: Bog'lovchi yo'lak uzunligi ${dist}m bo'ldi (max 50 metr ruxsat etiladi)!`);
        } else {
          setDistanceError(null);
          const connectingLine: ConnectingLine = {
            id: `conn-${Date.now()}`,
            points: nextPoints,
            lengthMeters: dist,
            isValid: true,
            targetStreetName: 'Eng yaqin ko\'cha',
          };
          if (onLineCompleted) onLineCompleted(connectingLine);
        }
      }
    }
  };

  const handleMouseMove = (lat: number, lng: number) => {
    setCursorCoords({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    if (interactiveMode === 'draw_line' && linePoints.length === 1) {
      const tempDist = calculateDistanceMeters(
        linePoints[0][0],
        linePoints[0][1],
        lat,
        lng
      );
      setCurrentLineDistance(tempDist);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      {/* Map Controls Header */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>GIS Qatlamlar:</span>
        </div>
        <label className="flex items-center space-x-1 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={showParcels}
            onChange={e => setShowParcels(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Kadastr chegaralari</span>
        </label>
        <label className="flex items-center space-x-1 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={showEntrances}
            onChange={e => setShowEntrances(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Kirish nuqtalari</span>
        </label>
        <label className="flex items-center space-x-1 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={showLines}
            onChange={e => setShowLines(e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
          <span>Bog'lovchi chiziqlar</span>
        </label>
      </div>

      {/* Coordinate & Distance Status Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 text-white px-3 py-1.5 rounded-lg shadow-md text-[11px] font-mono flex items-center space-x-4">
        <div>
          WGS-84: <span className="text-emerald-400">{cursorCoords.lat}, {cursorCoords.lng}</span>
        </div>
        {interactiveMode === 'draw_line' && (
          <div className="flex items-center space-x-1.5">
            <span>Masofa:</span>
            <span className={`font-bold ${currentLineDistance > 50 ? 'text-rose-400' : 'text-amber-300'}`}>
              {currentLineDistance}m
            </span>
            <span className="text-slate-400">(max 50m)</span>
          </div>
        )}
      </div>

      {/* Error / Instruction Warning Banner */}
      {distanceError && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] bg-rose-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <AlertTriangle className="w-4 h-4" />
          <span>{distanceError}</span>
        </div>
      )}

      {interactiveMode === 'add_entrance' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-medium">
          <MapPin className="w-4 h-4" />
          <span>Kadastr obyekti chegarasiga bosing va Asosiy kirish nuqtasini belgilang</span>
        </div>
      )}

      {interactiveMode === 'draw_line' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] bg-purple-700 text-white px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-medium">
          <Navigation className="w-4 h-4" />
          <span>Kirish nuqtasidan eng yaqin ko'chagacha bog'lovchi chiziq torting (max 50m)</span>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapInteractionHandler
          interactiveMode={interactiveMode}
          onMapClick={handleMapClick}
          onMouseMove={handleMouseMove}
        />

        {activeLayer === 'osm' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; OpenTopoMap'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Cadastral Parcels Boundaries (Polygons) */}
        {showParcels &&
          addresses.map(addr => {
            if (!addr.boundaryPolygon || addr.boundaryPolygon.length === 0) return null;
            const isSelected = selectedAddress?.id === addr.id;
            return (
              <Polygon
                key={`poly-${addr.id}`}
                positions={addr.boundaryPolygon}
                pathOptions={{
                  color: isSelected ? '#15803d' : addr.status === 'active' ? '#0284c7' : '#94a3b8',
                  fillColor: isSelected ? '#22c55e' : addr.status === 'active' ? '#38bdf8' : '#cbd5e1',
                  fillOpacity: isSelected ? 0.4 : 0.2,
                  weight: isSelected ? 3 : 2,
                }}
              />
            );
          })}

        {/* Connecting Lines */}
        {showLines &&
          addresses.map(addr => {
            if (!addr.connectingLine || !addr.connectingLine.points) return null;
            return (
              <Polyline
                key={`line-${addr.id}`}
                positions={addr.connectingLine.points}
                pathOptions={{
                  color: '#9333ea',
                  weight: 3,
                  dashArray: '5, 8',
                }}
              />
            );
          })}

        {/* Temporary line while drawing */}
        {linePoints.length > 0 && (
          <Polyline
            positions={linePoints}
            pathOptions={{
              color: currentLineDistance > 50 ? '#e11d48' : '#7c3aed',
              weight: 4,
              dashArray: '4, 4',
            }}
          />
        )}

        {/* Entrance points */}
        {showEntrances &&
          addresses.flatMap(addr =>
            addr.entrancePoints.map(ep => (
              <Marker
                key={`ep-${ep.id}`}
                position={[ep.lat, ep.lng]}
                icon={ep.type === 'main' ? entranceIcon : secondaryEntranceIcon}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <p className="font-bold text-blue-800">{ep.name || 'Kirish nuqtasi'}</p>
                    <p className="text-slate-600">Turi: {ep.type === 'main' ? 'Asosiy kirish eshigi' : 'Ikkilamchi kirish'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {ep.lat.toFixed(5)}, {ep.lng.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))
          )}

        {/* Address Markers */}
        {addresses.map(addr => (
          <Marker
            key={addr.id}
            position={[addr.lat, addr.lng]}
            icon={addr.status === 'active' ? activeIcon : cancelledIcon}
            eventHandlers={{
              click: () => onSelectAddress && onSelectAddress(addr),
            }}
          >
            <Popup>
              <div className="p-1 max-w-xs text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-emerald-800">{addr.geocode}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      addr.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {addr.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 leading-snug">{addr.fullAddressUz}</p>
                <p className="text-slate-500 mt-1">Kadastr: <span className="font-mono text-slate-700">{addr.cadastreNumber}</span></p>
                <p className="text-slate-500">Pochta indeksi: <span className="font-mono">{addr.postalCode}</span></p>
                {addr.connectingLine && (
                  <p className="text-purple-700 font-medium mt-1">
                    Bog'lovchi chiziq: {addr.connectingLine.lengthMeters}m
                  </p>
                )}
                {onSelectAddress && (
                  <button
                    onClick={() => onSelectAddress(addr)}
                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-2 rounded text-center block text-[11px]"
                  >
                    Batafsil ma'lumot
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
