"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MapPin, Loader2 } from "lucide-react"

// Leaflet must be loaded client-side only (no SSR)
const LocationPickerMap = dynamic(
  () => import("@/components/ui/location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[340px] items-center justify-center rounded-lg border border-border bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

interface LocationPickerResult {
  lat: number
  lng: number
  address: string
}

interface LocationPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialLat?: number
  initialLng?: number
  onConfirm: (result: LocationPickerResult) => void
}

export function LocationPickerDialog({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  onConfirm,
}: LocationPickerDialogProps) {
  const [pending, setPending] = useState<LocationPickerResult | null>(null)

  function handleConfirm() {
    if (!pending) return
    onConfirm(pending)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Pick Location on Map
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-1">
          Click anywhere on the map to place a pin. The address will be filled in automatically.
        </p>

        {open && (
          <LocationPickerMap
            initialLat={initialLat}
            initialLng={initialLng}
            onPinChange={setPending}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!pending} className="gap-2">
            <MapPin className="h-4 w-4" />
            Set Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
