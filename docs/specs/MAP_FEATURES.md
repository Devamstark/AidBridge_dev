# Map Features Documentation

## ✅ Updated Map Features

### Map Type Selector (Top-Right)

**4 Map Styles Available:**

1. **🗺️ Street** (Default)
   - Bright, clean OpenStreetMap tiles
   - Best for general navigation
   - Shows roads, cities, landmarks clearly
   - Light gray/white background

2. **🛰️ Satellite**
   - Real satellite imagery from Esri
   - Best for viewing terrain and urban areas
   - High-resolution aerial photos
   - Dark background (oceans appear dark blue)

3. **🏔️ Terrain**
   - Topographic map style
   - Shows elevation and terrain features
   - Best for outdoor/hiking contexts
   - Beige/tan background

4. **🌙 Dark**
   - Dark mode CartoDB tiles
   - Best for night viewing or preference
   - Matches app dark theme
   - Dark blue/gray background

### Layer Controls (Below Map Type)

Toggle visibility of:
- **Disasters** (Red/Orange/Yellow circles)
- **Locations** (Blue/Purple markers)
- **Volunteers** (Green/Yellow dots)

### Legend (Bottom-Left)

Shows color coding for:
- Disaster severity levels (5-1)
- Location types (Shelter, Distribution)
- Volunteer status (Available)

---

## 🎨 Map Appearance Comparison

### Street Map (Default - BRIGHT)
```
Background: Light gray (#f6f8f9)
Roads: White/Yellow
Water: Light blue
Text: Dark
Best for: Daytime use, general navigation
```

### Satellite Map
```
Background: Real imagery
Oceans: Dark blue
Land: Natural colors
Text: White with shadow
Best for: Viewing actual terrain, urban planning
```

### Terrain Map
```
Background: Beige/tan (#f4f1ea)
Elevation: Shaded relief
Text: Dark brown
Best for: Outdoor operations, hiking rescue
```

### Dark Map
```
Background: Dark blue-gray (#1e293b)
Roads: Light gray
Water: Dark
Text: Light
Best for: Night operations, dark theme preference
```

---

## 🎯 How to Use

### Change Map Type
1. Look at **top-right corner** of map
2. Click on map type button:
   - 🗺️ Street (bright, default)
   - 🛰️ Satellite (aerial photos)
   - 🏔️ Terrain (topographic)
   - 🌙 Dark (dark mode)
3. Map updates instantly

### Toggle Layers
1. Look at layer controls **below map type**
2. Check/uncheck:
   - Disasters
   - Locations
   - Volunteers
3. Markers appear/disappear instantly

### Interact with Map
- **Zoom:** Scroll wheel or +/- buttons
- **Pan:** Click and drag
- **View Details:** Click any marker
- **Close Popup:** Click X or outside popup

---

## 📊 Data Displayed

### Disasters (Circle Markers)
- **Size:** Indicates severity (larger = more severe)
- **Color:** 
  - Red = Severity 5 (Catastrophic)
  - Orange = Severity 4 (Severe)
  - Yellow = Severity 3 (Moderate)
  - Green = Severity 1-2 (Minor)

### Locations (Pin Markers)
- **Blue Pin:** Shelter
- **Purple Pin:** Distribution Center
- **Popup Shows:**
  - Name
  - Type
  - Occupancy with progress bar

### Volunteers (Small Circles)
- **Green:** Available
- **Yellow:** On Duty
- **Popup Shows:**
  - Name
  - Current status

---

## 🔧 Technical Details

### Map Library
- **React Leaflet v4.2.1**
- **Leaflet v1.9.4**

### Tile Providers
1. **Street:** OpenStreetMap (free, CC BY)
2. **Satellite:** Esri World Imagery (free for non-commercial)
3. **Terrain:** OpenTopoMap (free, CC BY-SA)
4. **Dark:** CARTO Dark Matter (free, CC BY)

### Performance
- **Initial Load:** ~1-2 seconds
- **Tile Caching:** Browser caches tiles automatically
- **Marker Rendering:** Client-side, instant updates

---

## 💡 Tips

### Best Map Types for Different Scenarios

| Scenario | Recommended Map | Why |
|----------|----------------|-----|
| Daytime operations | Street | Clear, easy to read |
| Search & rescue | Satellite | See actual terrain |
| Flood response | Satellite | See water extent |
| Wildfire response | Satellite + Terrain | See vegetation, elevation |
| Night operations | Dark | Easier on eyes |
| Planning meetings | Street or Terrain | Professional appearance |
| Public dashboard | Street | Most familiar to users |

### Keyboard Shortcuts
- **+ / -** : Zoom in/out
- **Arrow keys** : Pan map
- **Esc** : Close popup

---

## 🎨 Customization

### Change Default Map Type
Edit `src/components/maps/DisasterMap.jsx`:
```javascript
const [mapType, setMapType] = useState("satellite"); // Change from "street"
```

### Add More Map Types
Add to `MAP_TILES` object:
```javascript
traffic: {
  name: "Traffic",
  url: "https://your-traffic-tile-server.com/{z}/{x}/{y}.png",
  attribution: "Traffic data provider",
  background: "#f6f8f9",
}
```

### Adjust Initial View
Edit in `DisasterMap.jsx`:
```javascript
const defaultCenter = { lat: 37.8, lng: -122.4 }; // San Francisco
const defaultZoom = 10;
```

---

## ⚠️ Notes

1. **Internet Required:** Map tiles load from external servers
2. **Caching:** Tiles are cached by browser for faster subsequent loads
3. **Attribution:** All tile providers require attribution (shown in map corner)
4. **Mobile:** Touch gestures work on mobile devices
5. **Print:** Map prints as shown (use browser print function)

---

## 🚀 Future Enhancements

Potential additions:
- [ ] Real-time traffic layer
- [ ] Weather overlay (radar, clouds)
- [ ] Heat maps for disaster density
- [ ] Cluster markers for many items
- [ ] Draw tools (polygons, lines)
- [ ] Measurement tool (distance, area)
- [ ] GPS location button
- [ ] Print map button

---

**Map is now fully functional with 4 different styles! 🗺️**

*Updated: March 3, 2026*
