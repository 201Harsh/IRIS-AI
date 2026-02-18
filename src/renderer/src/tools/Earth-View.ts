import axios from 'axios'

export const handleOpenMap = async (location: string) => {
  console.log(`🗺️ Opening Map for: ${location}`)

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    const res = await axios.get(geoUrl)

    if (!res.data || res.data.length === 0) return '❌ Location not found.'

    const { lat, lon, display_name } = res.data[0]

    const event = new CustomEvent('map-update', {
      detail: {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        name: display_name.split(',')[0]
      }
    })
    window.dispatchEvent(event)

    return `Opening secure map view of ${display_name.split(',')[0]}.`
  } catch (e) {
    return '❌ Map system offline.'
  }
}

export const handleNavigation = async (origin: string, destination: string) => {
  console.log(`🗺️ Calculating Route: ${origin} ➡ ${destination}`)

  try {
    const res1 = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origin)}`
    )
    if (!res1.data.length) return `❌ Could not find: ${origin}`
    const start = {
      lat: parseFloat(res1.data[0].lat),
      lon: parseFloat(res1.data[0].lon),
      name: res1.data[0].display_name.split(',')[0]
    }

    const res2 = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`
    )
    if (!res2.data.length) return `❌ Could not find: ${destination}`
    const end = {
      lat: parseFloat(res2.data[0].lat),
      lon: parseFloat(res2.data[0].lon),
      name: res2.data[0].display_name.split(',')[0]
    }

    const routeUrl = `http://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
    const routeRes = await axios.get(routeUrl)

    if (!routeRes.data.routes || routeRes.data.routes.length === 0) return '❌ No route found.'

    const route = routeRes.data.routes[0]
    const distanceKm = (route.distance / 1000).toFixed(1)
    const durationMin = Math.round(route.duration / 60)

    const path = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])

    const event = new CustomEvent('map-route', {
      detail: {
        start: [start.lat, start.lon],
        end: [end.lat, end.lon],
        path: path,
        info: {
          origin: start.name,
          destination: end.name,
          distance: `${distanceKm} km`,
          duration: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
        }
      }
    })
    window.dispatchEvent(event)

    return `Route calculated. Distance: ${distanceKm} km. Est. Time: ${Math.floor(durationMin / 60)} hours ${durationMin % 60} minutes.`
  } catch (e) {
    return '❌ Navigation system offline.'
  }
}
