"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"

// Fix Leaflet's default marker icon path broken by webpack asset hashing
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Bocaue, Bulacan — default map center
const BOCAUE_CENTER: [number, number] = [14.7987, 120.9355]

interface PendingPin {
  lat: number
  lng: number
  address: string
}

interface LocationPickerMapProps {
  initialLat?: number
  initialLng?: number
  onPinChange: (pin: PendingPin | null) => void
}

function ClickHandler({ onClickLatLng }: { onClickLatLng: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClickLatLng(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPickerMap({ initialLat, initialLng, onPinChange }: LocationPickerMapProps) {
  const initial: [number, number] | null =
    initialLat !== undefined && initialLng !== undefined ? [initialLat, initialLng] : null

  const [marker, setMarker] = useState<[number, number] | null>(initial)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [addressLabel, setAddressLabel] = useState<string>(
    initial ? `${initial[0].toFixed(6)}, ${initial[1].toFixed(6)}` : ""
  )

  // If an initial position is supplied, reverse-geocode it once on mount
  useEffect(() => {
    if (!initial) return
    reverseGeocode(initial[0], initial[1])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function reverseGeocode(lat: number, lng: number) {
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en", "User-Agent": "MHACTO-CMS/1.0" } }
      )
      const data = await res.json()
      const addr: string = data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddressLabel(addr)
      onPinChange({ lat, lng, address: addr })
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddressLabel(fallback)
      onPinChange({ lat, lng, address: fallback })
    } finally {
      setIsGeocoding(false)
    }
  }

  function handleClick(lat: number, lng: number) {
    setMarker([lat, lng])
    setAddressLabel("")
    reverseGeocode(lat, lng)
  }

  return (
    <div className="flex flex-col gap-2">
      <MapContainer
        center={marker ?? BOCAUE_CENTER}
        zoom={15}
        style={{ height: "340px", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onClickLatLng={handleClick} />
        {marker && <Marker position={marker} icon={markerIcon} />}
      </MapContainer>

      <p className="min-h-[1.25rem] text-xs text-muted-foreground">
        {isGeocoding
          ? "Resolving address…"
          : marker
          ? addressLabel || `${marker[0].toFixed(6)}, ${marker[1].toFixed(6)}`
          : "Click anywhere on the map to drop a pin."}
      </p>
    </div>
  )
}
