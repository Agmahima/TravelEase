import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue
import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Location = {
  name: string;
  lat: number;
  lng: number;
};

type ItineraryMapProps = {
  locations: Location[];
};

const ItineraryMap: React.FC<ItineraryMapProps> = ({ locations }) => {
  if (locations.length === 0) return <p>No locations found.</p>;

  const center = {
    lat: locations[0].lat,
    lng: locations[0].lng,
  };

  return (
    <MapContainer center={center} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, idx) => (
        <Marker key={idx} position={[loc.lat, loc.lng]}>
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ItineraryMap;
