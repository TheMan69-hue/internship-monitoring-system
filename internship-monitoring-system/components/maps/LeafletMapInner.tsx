"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & {
  _getIconUrl?: unknown;
})._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LeafletMapInnerProps = {
  latitude: number;
  longitude: number;
};

export default function LeafletMapInner({
  latitude,
  longitude,
}: LeafletMapInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      scrollWheelZoom={true}
      className="h-[350px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[latitude, longitude]}>
        <Popup>
          Student Time-In Location
        </Popup>
      </Marker>
    </MapContainer>
  );
}