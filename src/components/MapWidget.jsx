import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { animate: true, duration: 2.5 });
  }, [center, map]);
  return null;
}

const MapWidget = ({ nombreArtista, coords }) => {
  const posicion = coords || [20.6133, -100.4053];

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      <MapContainer center={posicion} zoom={12} style={{ height: '100%', width: '100%' }}>
        <FlyToLocation center={posicion} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={posicion}>
          <Popup><strong>{nombreArtista}</strong><br/>Ubicación Real</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
export default MapWidget;