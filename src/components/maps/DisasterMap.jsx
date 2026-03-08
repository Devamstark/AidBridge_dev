import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDisasters } from "@/hooks/useDisasters";
import { useLocations } from "@/hooks/useLocations";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useEmergencyRequests } from "@/hooks/useEmergencyDispatch";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Users, HeartPulse, Layers, Map as MapIcon, Settings2, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Fix for default marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Map tile options
const MAP_TILES = {
  street: {
    name: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    background: "#f6f8f9",
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    background: "#1a1a2e",
  },
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    background: "#1e293b",
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    background: "#f4f1ea",
  },
};

// No mock data - using hooks now

const getDisasterColor = (severity) => {
  if (severity >= 5) return "#ef4444";
  if (severity >= 4) return "#f97316";
  if (severity >= 3) return "#eab308";
  return "#22c55e";
};

const getLocationColor = (type) => {
  return type === "shelter" ? "#3b82f6" : "#8b5cf6";
};

const getVolunteerColor = (status) => {
  return status === "AVAILABLE" ? "#22c55e" : "#eab308";
};

// HeatMap component: A safe, React-leafet compatible way to show density
function HeatmapLayer({ requests }) {
  if (!requests || requests.length === 0) return null;

  // Group requests by proximity to create larger "hot zones"
  return requests.filter(r => r.latitude && r.longitude).map((r, i) => (
    <CircleMarker
      key={`heat-${i}`}
      center={[r.latitude, r.longitude]}
      radius={30}
      pathOptions={{
        fillColor: r.priority === 'P0' ? '#ef4444' : '#f59e0b',
        color: 'transparent',
        fillOpacity: 0.1,
      }}
      interactive={false}
    />
  ));
}

export default function DisasterMap({ height = "400px", showControls = true }) {
  const [mapType, setMapType] = useState("street"); // street, satellite, dark, terrain
  const [activeLayers, setActiveLayers] = useState({
    disasters: true,
    locations: true,
    volunteers: true,
    requests: true,
    heatmap: false,
  });

  const { data: disasters = [] } = useDisasters({ limit: 100 });
  const { data: locations = [] } = useLocations({ limit: 100 });
  const { data: volunteers = [] } = useVolunteers({ limit: 200 });
  const { data: requests = [] } = useEmergencyRequests({ limit: 100 });

  const defaultCenter = { lat: 32.0, lng: -95.0 };
  const defaultZoom = 5;

  const currentTiles = MAP_TILES[mapType];

  if (typeof window === "undefined") {
    return (
      <div style={{ height }} className="w-full bg-slate-700/50 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-700 relative" style={{ height }}>
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ background: currentTiles.background }}
      >
        <TileLayer
          attribution={currentTiles.attribution}
          url={currentTiles.url}
        />

        {/* Disaster Markers */}
        {activeLayers.disasters && disasters.filter(d => d.latitude && d.longitude).map((disaster) => (
          <React.Fragment key={disaster.id}>
            {disaster.radius > 0 && (
              <Circle
                center={[disaster.latitude, disaster.longitude]}
                radius={disaster.radius}
                pathOptions={{
                  fillColor: '#ff0000',
                  color: '#ff0000',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
            )}
            <CircleMarker
              center={[disaster.latitude, disaster.longitude]}
              radius={(disaster.severity || 1) * 8}
              fillColor={getDisasterColor(disaster.severity)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-slate-900">{disaster.name}</h3>
                  <p className="text-sm text-slate-600 capitalize">Type: {disaster.disasterType}</p>
                  <p className="text-sm text-slate-600">Severity: {disaster.severity}/5</p>
                  <p className="text-xs text-slate-400 mt-1">{disaster.affectedArea}</p>
                  {disaster.radius > 0 && (
                    <p className="text-xs text-slate-500 mt-1 italic">Impact Radius: {disaster.radius}m</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}

        {/* Emergency Request Markers */}
        {activeLayers.requests && requests.filter(r => r.latitude && r.longitude).map((req) => (
          <CircleMarker
            key={req.id}
            center={[req.latitude, req.longitude]}
            radius={req.priority === 'P0' ? 12 : 8}
            fillColor={req.priority === 'P0' ? "#ef4444" : "#f59e0b"}
            color={req.priority === 'P0' ? "#fff" : "transparent"}
            weight={req.priority === 'P0' ? 3 : 0}
            opacity={1}
            fillOpacity={0.8}
            className={req.priority === 'P0' ? "animate-pulse" : ""}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1">
                    <HeartPulse className={`w-4 h-4 ${req.priority === 'P0' ? 'text-red-500' : 'text-amber-500'}`} />
                    {req.type}
                  </h3>
                  <Badge variant={req.priority === 'P0' ? "destructive" : "secondary"}>{req.priority}</Badge>
                </div>
                <p className="text-sm text-slate-700 font-medium mb-1">{req.isPublic ? req.fullName : 'Internal Request'}</p>
                <p className="text-sm text-slate-600 line-clamp-2 italic">"{req.description}"</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Badge className="text-[10px] uppercase">{req.status}</Badge>
                  {req.isPublic && <span className="text-[10px] text-blue-500 font-bold">PORTAL</span>}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Location Markers */}
        {activeLayers.locations && locations.filter(l => l.latitude && l.longitude).map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-slate-900">{location.name}</h3>
                <p className="text-sm text-slate-600 capitalize">Type: {location.locationType?.toLowerCase()}</p>
                <p className="text-sm text-slate-600">
                  Occupancy: {location.currentOccupancy || 0} / {location.capacity || "N/A"}
                </p>
                {location.capacity > 0 && (
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((location.currentOccupancy || 0) / location.capacity) * 100}%` }}
                    />
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">{location.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Volunteer Markers */}
        {activeLayers.volunteers && volunteers.filter(v => v.currentLat && v.currentLng).map((volunteer) => (
          <CircleMarker
            key={volunteer.id}
            center={[volunteer.currentLat, volunteer.currentLng]}
            radius={6}
            fillColor={getVolunteerColor(volunteer.status)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <h3 className="font-semibold text-slate-900">{volunteer.user?.fullName || "Volunteer"}</h3>
                <p className="text-sm text-slate-600">Status: {volunteer.status}</p>
                {volunteer.status === 'ON_DUTY' && <p className="text-xs text-amber-600 font-medium">Currently Responding</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {/* Heat Map Layer */}
        {activeLayers.heatmap && (
          <HeatmapLayer requests={requests} />
        )}
      </MapContainer>

      {/* Map Controls (Top-Right) */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {/* Map Type Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 transition-all"
                title="Change Map Style"
              >
                <MapIcon className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" align="start" className="w-48 p-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl">
              <h4 className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Settings2 className="w-3 h-3" /> Map Style
              </h4>
              <div className="space-y-1">
                {[
                  { key: "street", icon: "🗺️", label: "Street" },
                  { key: "satellite", icon: "🛰️", label: "Satellite" },
                  { key: "terrain", icon: "🏔️", label: "Terrain" },
                  { key: "dark", icon: "🌙", label: "Dark" },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setMapType(key)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all",
                      mapType === key
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "text-slate-600 hover:bg-slate-100 border border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      {label}
                    </span>
                    {mapType === key && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Layers Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-green-600 transition-all"
                title="Toggle Layers"
              >
                <Layers className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" align="start" className="w-48 p-2 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl">
              <h4 className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Visible Layers</h4>
              <div className="space-y-1">
                {[
                  { key: 'disasters', label: 'Disasters', color: 'bg-red-500' },
                  { key: 'locations', label: 'Locations', color: 'bg-blue-500' },
                  { key: 'volunteers', label: 'Volunteers', color: 'bg-green-500' },
                  { key: 'requests', label: 'Requests', color: 'bg-amber-500' },
                  { key: 'heatmap', label: 'Request Heatmap', color: 'bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500' },
                ].map(({ key, label, color }) => (
                  <label
                    key={key}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all",
                      activeLayers[key] ? "bg-slate-50 text-slate-900" : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", color)} />
                      {label}
                    </div>
                    <input
                      type="checkbox"
                      checked={activeLayers[key]}
                      onChange={(e) => setActiveLayers({ ...activeLayers, [key]: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg border border-slate-200 p-3">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Severe (5)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High (4)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Moderate (3)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Shelter</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Distribution</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span>Emergency Request</span>
          </div>
        </div>
      </div>
    </div>
  );
}
