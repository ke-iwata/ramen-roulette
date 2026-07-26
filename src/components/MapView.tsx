import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CHAIN_COLORS,
  CUSTOM_CHAIN_COLOR,
  LINES,
  gymImageUrl,
  type Gym,
} from '../data/gyms'

interface Props {
  gyms: Gym[]
  onSelect: (gym: Gym) => void
  onBack: () => void
}

const CENTER: [number, number] = [35.6935, 139.8755]

// 写真をそのままピンにする(円形サムネ + 下向きの尻尾)
function pinIcon(gym: Gym, color: string) {
  const img = gymImageUrl(gym, 96)
  const inner = img
    ? `<img src="${img}" alt="" loading="lazy" />`
    : `<span class="pin-fallback">${gym.name.charAt(0)}</span>`
  return L.divIcon({
    className: 'ramen-pin-wrap',
    html: `<div class="ramen-pin" style="--pin:${color}">${inner}<i class="pin-tail"></i></div>`,
    iconSize: [46, 54],
    iconAnchor: [23, 54],
  })
}

export default function MapView({ gyms, onSelect, onBack }: Props) {
  const holderRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const [station, setStation] = useState('all')
  const [visibleCount, setVisibleCount] = useState(0)

  const shown = useMemo(
    () =>
      gyms.filter(
        (g) => g.lat != null && (station === 'all' || g.chain === station),
      ),
    [gyms, station],
  )

  // 地図の初期化(一度だけ)
  useEffect(() => {
    if (!holderRef.current || mapRef.current) return
    const map = L.map(holderRef.current, {
      center: CENTER,
      zoom: 13,
      zoomControl: true,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // 表示範囲内の店だけピンを描く(全件描くと重いため)
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    const render = () => {
      const bounds = map.getBounds().pad(0.2)
      const inView = shown.filter((g) => bounds.contains([g.lat!, g.lng!]))
      layer.clearLayers()
      for (const gym of inView.slice(0, 160)) {
        const color = CHAIN_COLORS[gym.chain ?? ''] ?? CUSTOM_CHAIN_COLOR
        L.marker([gym.lat!, gym.lng!], {
          icon: pinIcon(gym, color),
          title: gym.name,
        })
          .addTo(layer)
          .on('click', () => onSelect(gym))
      }
      setVisibleCount(inView.length)
    }

    render()
    map.on('moveend zoomend', render)
    return () => {
      map.off('moveend zoomend', render)
    }
  }, [shown, onSelect])

  // 駅を選んだらその駅へ寄る
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (station === 'all') {
      map.setView(CENTER, 13)
      return
    }
    const pts = shown.map((g) => [g.lat!, g.lng!] as [number, number])
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.25))
  }, [station, shown])

  return (
    <section className="mapview">
      <div className="map-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← ルーレットに戻る
        </button>
        <select
          className="station-select"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        >
          <option value="all">すべての駅({gyms.filter((g) => g.lat).length}店)</option>
          {LINES.map((line) => (
            <optgroup key={line.name} label={line.name}>
              {line.stations.map((s) => (
                <option key={s} value={s}>
                  {s} ({gyms.filter((g) => g.chain === s).length})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="map-holder" ref={holderRef} />

      <p className="map-hint">
        ピンをタップすると店の情報が見られます(この範囲に {visibleCount} 店
        {visibleCount > 160 && ' / 表示は160店まで'})
      </p>
    </section>
  )
}
