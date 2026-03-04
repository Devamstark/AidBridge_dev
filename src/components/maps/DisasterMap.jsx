import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// Mock data for map
const mockDisasters = [
  { id: 1, name: "Hurricane Milton", lat: 27.9506, lng: -82.4572, type: "hurricane", severity: 4 },
  { id: 2, name: "California Wildfires", lat: 34.0522, lng: -118.2437, type: "wildfire", severity: 5 },
  { id: 3, name: "Texas Flooding", lat: 29.7604, lng: -95.3698, type: "flood", severity: 3 },
];

const mockLocations = [
  { id: 1, name: "Central High School Shelter", lat: 27.9506, lng: -82.4572, type: "shelter", occupancy: 342, capacity: 500 },
  { id: 2, name: "Community Center", lat: 27.9600, lng: -82.4700, type: "distribution", occupancy: 85, capacity: 200 },
];

const mockVolunteers = [
  { id: 1, name: "John Smith", lat: 27.9700, lng: -82.4500, status: "AVAILABLE" },
  { id: 2, name: "Sarah Johnson", lat: 27.9400, lng: -82.4800, status: "ON_DUTY" },
];

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

export default function DisasterMap({ height = "400px", showControls = true }) {
  const [mapType, setMapType] = useState("street"); // street, satellite, dark, terrain
  const [activeLayers, setActiveLayers] = useState({
    disasters: true,
    locations: true,
    volunteers: true,
  });

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
        {activeLayers.disasters && mockDisasters.map((disaster) => (
          <CircleMarker
            key={disaster.id}
            center={[disaster.lat, disaster.lng]}
            radius={disaster.severity * 8}
            fillColor={getDisasterColor(disaster.severity)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-slate-900">{disaster.name}</h3>
                <p className="text-sm text-slate-600 capitalize">Type: {disaster.type}</p>
                <p className="text-sm text-slate-600">Severity: {disaster.severity}/5</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Location Markers */}
        {activeLayers.locations && mockLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-slate-900">{location.name}</h3>
                <p className="text-sm text-slate-600 capitalize">Type: {location.type}</p>
                <p className="text-sm text-slate-600">
                  Occupancy: {location.occupancy} / {location.capacity}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(location.occupancy / location.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Volunteer Markers */}
        {activeLayers.volunteers && mockVolunteers.map((volunteer) => (
          <CircleMarker
            key={volunteer.id}
            center={[volunteer.lat, volunteer.lng]}
            radius={6}
            fillColor={getVolunteerColor(volunteer.status)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <h3 className="font-semibold text-slate-900">{volunteer.name}</h3>
                <p className="text-sm text-slate-600">Status: {volunteer.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Type Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-slate-200 p-3">
          <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map Type
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
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  mapType === key
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="mr-1.5">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Layer Controls */}
      {showControls && (
        <div className="absolute top-48 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-slate-200 p-3">
          <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Layers
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.disasters}
                onChange={(e) => setActiveLayers({ ...activeLayers, disasters: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Disasters
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.locations}
                onChange={(e) => setActiveLayers({ ...activeLayers, locations: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Locations
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.volunteers}
                onChange={(e) => setActiveLayers({ ...activeLayers, volunteers: e.target.checked })}
                className="rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Volunteers
              </span>
            </label>
          </div>
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
        </div>
      </div>
    </div>
  );
}
