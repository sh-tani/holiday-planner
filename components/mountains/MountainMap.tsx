"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Mountain = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  elevation: number | null
}

type Props = {
  mountains: Mountain[]
}

const mountainIcon = L.divIcon({
  className: "mountain-marker",
  html: `<div class="mountain-marker-pin"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
})

export default function MountainMap({ mountains }: Props) {
  return (
    <MapContainer
      center={[35.2, 136.0]}
      zoom={7}
      scrollWheelZoom={true}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mountains.map((mountain) => (
        <Marker
          key={mountain.id}
          position={[mountain.latitude, mountain.longitude]}
          icon={mountainIcon}
        >
          <Popup>
            <strong>{mountain.name}</strong>
            <br />
            {mountain.area}

            {mountain.elevation && (
              <>
                <br />
                標高 {mountain.elevation}m
              </>
            )}

            <div style={{ marginTop: "10px" }}>
              <a
                href={`/?mountainId=${encodeURIComponent(mountain.id)}`}
                style={{
                  display: "inline-block",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                この山で予定登録
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}