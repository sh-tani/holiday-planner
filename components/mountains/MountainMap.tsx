"use client"

import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Mountain = {
  id: string
  name: string
  area: string
  prefecture: string | null
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

  function MapBoundsController({
    mountains,
  }: {
    mountains: Mountain[]
  }) {
    const map = useMap()

    useEffect(() => {
      if (mountains.length === 0) return

      const timer = window.setTimeout(() => {
        if (!map.getContainer()) return

        if (mountains.length === 1) {
          map.setView(
            [mountains[0].latitude, mountains[0].longitude],
            12,
            {
              animate: false,
            }
          )
          return
        }

        const bounds = L.latLngBounds(
          mountains.map((mountain) => [
            mountain.latitude,
            mountain.longitude,
          ])
        )

        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 12,
          animate: false,
        })
      }, 100)

      return () => {
        window.clearTimeout(timer)
      }
    }, [map, mountains])

    return null
  }

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

      <MapBoundsController mountains={mountains} />

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