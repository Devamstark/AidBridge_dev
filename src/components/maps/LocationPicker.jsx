import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, Minimize2, Maximize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
}

function LocationMarker({ position, setPosition, radius }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? (
        <>
            <Marker position={position} />
            {radius > 0 && (
                <Circle
                    center={position}
                    radius={radius}
                    pathOptions={{ fillColor: '#ef4444', color: '#ef4444', fillOpacity: 0.2 }}
                />
            )}
        </>
    ) : null;
}

export default function LocationPicker({
    value = { lat: 0, lng: 0, radius: 10 },
    onChange,
    height = "300px"
}) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSearch = async () => {
        if (!search.trim()) return;
        setLoading(true);
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=5`);
            const data = await resp.json();
            setResults(data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const selectResult = (res) => {
        const lat = parseFloat(res.lat);
        const lng = parseFloat(res.lon);
        onChange({ ...value, lat, lng });
        setResults([]);
        setSearch(res.display_name);
    };

    const handlePositionChange = (pos) => {
        onChange({ ...value, lat: pos[0], lng: pos[1] });
    };

    const currentPos = value.lat && value.lng ? [value.lat, value.lng] : null;

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search address or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                        className="pl-9"
                    />
                    {results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-xl z-[2000] max-h-48 overflow-auto">
                            {results.map((res, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-0 transition-colors"
                                    onClick={(e) => { e.preventDefault(); selectResult(res); }}
                                >
                                    {res.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => { e.preventDefault(); handleSearch(); }}
                    disabled={loading}
                >
                    {loading ? "..." : "Search"}
                </Button>
            </div>

            <div
                className={`relative rounded-lg overflow-hidden border border-slate-700 transition-all duration-300 ${isExpanded ? 'h-[500px]' : ''}`}
                style={{ height: isExpanded ? "500px" : height }}
            >
                <MapContainer
                    center={currentPos || [32.0, -95.0]}
                    zoom={currentPos ? 13 : 4}
                    className="h-full w-full z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={currentPos}
                        setPosition={handlePositionChange}
                        radius={value.radius || 10}
                    />
                    {currentPos && <MapUpdater center={currentPos} />}
                </MapContainer>

                <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg h-9 w-9 bg-white/90 hover:bg-white text-slate-900"
                        onClick={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="absolute top-4 left-4 z-[1000]">
                    <Badge className="bg-blue-600/90 text-white shadow-lg pointer-events-none">
                        <MapPin className="w-3 h-3 mr-1" />
                        {currentPos ? `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : "Click map to pin location"}
                    </Badge>
                </div>

                {value.radius > 0 && (
                    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 p-2 rounded-md shadow-lg border text-xs text-slate-700">
                        Highlight Area: <strong>{value.radius}m</strong>
                    </div>
                )}
            </div>
        </div>
    );
}
