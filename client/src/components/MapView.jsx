import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function MapView({ resorts }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [activeResort, setActiveResort] = useState(null)

  useEffect(() => {
    if (!resorts || resorts.length === 0) return
    if (map.current) return

    const validResorts = resorts.filter(r => r.mapboxCoords?.lat && r.mapboxCoords?.lng)
    if (validResorts.length === 0) return

    const avgLat = validResorts.reduce((sum, r) => sum + r.mapboxCoords.lat, 0) / validResorts.length
    const avgLng = validResorts.reduce((sum, r) => sum + r.mapboxCoords.lng, 0) / validResorts.length

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [avgLng, avgLat],
      zoom: 6
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      validResorts.forEach((resort, i) => {
        const passColor = resort.passType === 'Ikon'
          ? '#a855f7'
          : resort.passType === 'Epic'
          ? '#3b82f6'
          : '#64748b'

        const el = document.createElement('div')
        el.className = 'custom-marker'
        el.style.cssText = `
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${passColor};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: transform 0.15s ease;
        `
        el.innerHTML = '⛷️'
        el.title = resort.name

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)'
          setActiveResort(resort)
        })
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
          setActiveResort(null)
        })

        new mapboxgl.Marker(el)
          .setLngLat([resort.mapboxCoords.lng, resort.mapboxCoords.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20, closeButton: false })
              .setHTML(`
                <div style="font-family: system-ui; padding: 4px;">
                  <p style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #0f172a">${resort.name}</p>
                  <p style="font-size: 12px; color: #475569; margin: 0 0 2px 0">${resort.region}</p>
                  <p style="font-size: 12px; color: #475569; margin: 0 0 6px 0">${resort.passType} Pass · $${resort.estimatedLiftTicket}/day</p>
                  <a href="${resort.bookingUrl}" target="_blank" style="font-size: 12px; color: #2563eb; font-weight: 600; text-decoration: none;">Get Tickets →</a>
                </div>
              `)
          )
          .addTo(map.current)
      })

      if (validResorts.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        validResorts.forEach(r => bounds.extend([r.mapboxCoords.lng, r.mapboxCoords.lat]))
        map.current.fitBounds(bounds, { padding: 80, maxZoom: 10 })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [resorts])

  if (!resorts || resorts.length === 0) return null

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/50" style={{ height: '420px' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-4 text-xs text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          Ikon
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Epic
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" />
          Other
        </span>
      </div>
    </div>
  )
}
