import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression } from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center as L.LatLngTuple, 13, { duration: 2.5 })
  }, [center, map])
  return null
}

export default function LeafletMapWidget() {
  const [isVisible, setIsVisible] = useState(false)

  const [position, setPosition] = useState<LatLngExpression>([51.505, -0.09])
  const [locationName, setLocationName] = useState('India')

  const [isRouteMode, setIsRouteMode] = useState(false)
  const [routeData, setRouteData] = useState<any>(null)

  useEffect(() => {
    const handleMap = (event: any) => {
      const { lat, lng, name } = event.detail
      if (lat && lng) {
        setIsRouteMode(false)
        setPosition([lat, lng])
        setLocationName(name)
        setIsVisible(true)
      }
    }

    const handleRoute = (event: any) => {
      const data = event.detail
      setIsRouteMode(true)
      setRouteData(data)
      setPosition(data.start)
      setIsVisible(true)
    }

    window.addEventListener('map-update', handleMap)
    window.addEventListener('map-route', handleRoute)

    return () => {
      window.removeEventListener('map-update', handleMap)
      window.removeEventListener('map-route', handleRoute)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-9000 flex items-center justify-center bg-black/80 backdrop-blur-md p-10 animate-in fade-in zoom-in duration-300">
      <div className="relative w-full h-full max-w-6xl max-h-[85vh] border-2 border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.2)]">
        <div className="absolute top-0 left-0 w-full z-1000 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/90 border border-cyan-500/50 px-4 py-2 rounded-lg pointer-events-auto">
            {isRouteMode && routeData ? (
              <div>
                <h2 className="text-cyan-400 font-bold tracking-widest text-sm">
                  NAV: {routeData.info.origin} ➡ {routeData.info.destination}
                </h2>
                <div className="text-gray-400 text-xs font-mono mt-1">
                  DIST: <span className="text-white">{routeData.info.distance}</span> | TIME:{' '}
                  <span className="text-white">{routeData.info.duration}</span>
                </div>
              </div>
            ) : (
              <h2 className="text-cyan-400 font-bold tracking-widest text-sm">
                TARGET: {locationName}
              </h2>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500 px-4 py-2 rounded-lg font-bold pointer-events-auto"
          >
            CLOSE
          </button>
        </div>

        <MapContainer
          {...({ center: position, zoom: isRouteMode ? 6 : 13 } as any)}
          style={{ height: '100%', width: '100%', background: '#000' }}
        >
          <TileLayer
            {...({
              attribution: '&copy; Google Maps',
              url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}'
            } as any)}
          />

          {!isRouteMode && (
            <Marker position={position}>
              <Popup>{locationName}</Popup>
            </Marker>
          )}

          {isRouteMode && routeData && (
            <>
              <Marker position={routeData.start}>
                <Popup>Start: {routeData.info.origin}</Popup>
              </Marker>
              <Marker position={routeData.end}>
                <Popup>End: {routeData.info.destination}</Popup>
              </Marker>

              <Polyline
                positions={routeData.path}
                pathOptions={{ color: '#22d3ee', weight: 4, dashArray: '10, 10', opacity: 0.8 }}
              />

              <MapUpdater center={routeData.start} />
            </>
          )}

          {!isRouteMode && <MapUpdater center={position} />}
        </MapContainer>
      </div>
    </div>
  )
}
