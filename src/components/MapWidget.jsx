import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// --- SOLUCIÓN PARA EL ERROR 404 DE ICONOS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --------------------------------------------

function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
        map.flyTo(center, 12, { animate: true, duration: 2 });
    }
  }, [center, map]);
  return null;
}

const MapWidget = ({ nombreArtista, coords }) => {
  const posicion = coords || [20.6133, -100.4053];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      <MapContainer center={posicion} zoom={12} style={{ height: '100%', width: '100%' }}>
        <FlyToLocation center={posicion} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={posicion}>
          <Popup>{nombreArtista}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
export default MapWidget;