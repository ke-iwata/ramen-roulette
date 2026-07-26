import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import {
  CHAIN_COLORS,
  CUSTOM_CHAIN_COLOR,
  LINES,
  gymImageUrl,
  type Gym,
} from '../data/gyms'

interface Props {
  gyms: Gym[]
  selectedIds: string[]
  onSelect: (gym: Gym) => void
  onBack: () => void
  onConfirm: () => void
}

const CENTER: [number, number] = [35.6935, 139.8755]

// 写真をそのままピンにする(円形サムネ + 下向きの尻尾)
function pinIcon(gym: Gym, color: string, picked: boolean) {
  const img = gymImageUrl(gym, 96)
  const inner = img
    ? `<img src="${img}" alt="" loading="lazy" />`
    : `<span class="pin-fallback">${gym.name.charAt(0)}</span>`
  const check = picked ? '<b class="pin-check">✓</b>' : ''
  return L.divIcon({
    className: 'ramen-pin-wrap',
    html: `<div class="ramen-pin ${picked ? 'picked' : 'unpicked'}" style="--pin:${color}">${inner}${check}<i class="pin-tail"></i></div>`,
    iconSize: [46, 54],
    iconAnchor: [23, 54],
  })
}

// 近い店をまとめたときの丼形バッジ
function clusterIcon(cluster: L.MarkerCluster) {
  const n = cluster.getChildCount()
  const size = n < 10 ? 42 : n < 50 ? 50 : 58
  return L.divIcon({
    className: 'ramen-cluster-wrap',
    html: `<div class="ramen-cluster" style="width:${size}px;height:${size}px">${n}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function MapView({
  gyms,
  selectedIds,
  onSelect,
  onBack,
  onConfirm,
}: Props) {
  const holderRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const [station, setStation] = useState('all')
  const firstRun = useRef(true)

  const shown = useMemo(
    () =>
      gyms.filter(
        (g) => g.lat != null && (station === 'all' || g.chain === station),
      ),
    [gyms, station],
  )
  const shownRef = useRef(shown)
  shownRef.current = shown
  const picked = useMemo(() => new Set(selectedIds), [selectedIds])

  // 地図の初期化(一度だけ)
  useEffect(() => {
    if (!holderRef.current || mapRef.current) return
    const map = L.map(holderRef.current, {
      center: CENTER,
      zoom: 13,
      zoomSnap: 0,
      zoomDelta: 0.5,
      zoomControl: true,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 55,
      showCoverageOnHover: false,
      spiderfyDistanceMultiplier: 1.6,
      iconCreateFunction: clusterIcon,
    })
    map.addLayer(cluster)
    clusterRef.current = cluster
    mapRef.current = map

    // ダブルタップしたまま下へなぞるとズーム(上へなぞると引く)
    const el = map.getContainer()
    let lastTap = 0
    let zooming = false
    let startY = 0
    let startZoom = 13
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const now = Date.now()
      if (now - lastTap < 320) {
        zooming = true
        startY = e.touches[0].clientY
        startZoom = map.getZoom()
        map.dragging.disable()
        e.preventDefault()
      }
      lastTap = now
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!zooming || e.touches.length !== 1) return
      const dy = e.touches[0].clientY - startY
      map.setZoom(Math.min(19, Math.max(11, startZoom + dy / 55)), {
        animate: false,
      })
      e.preventDefault()
    }
    const onTouchEnd = () => {
      if (!zooming) return
      zooming = false
      map.dragging.enable()
    }
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      map.remove()
      mapRef.current = null
      clusterRef.current = null
    }
  }, [])

  // ピンを差し替える(クラスタが表示範囲を管理するので全件渡してよい)
  useEffect(() => {
    const cluster = clusterRef.current
    if (!cluster) return
    cluster.clearLayers()
    const markers = shown.map((gym) => {
      const color = CHAIN_COLORS[gym.chain ?? ''] ?? CUSTOM_CHAIN_COLOR
      return L.marker([gym.lat!, gym.lng!], {
        icon: pinIcon(gym, color, picked.has(gym.id)),
        title: gym.name,
      }).on('click', () => onSelect(gym))
    })
    cluster.addLayers(markers)
  }, [shown, picked, onSelect])

  // 駅を選んだときだけ寄る(初回とピン再生成では動かさない)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    if (station === 'all') {
      map.setView(CENTER, 13)
      return
    }
    const pts = shownRef.current.map((g) => [g.lat!, g.lng!] as [number, number])
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.25))
  }, [station])

  return (
    <section className="mapview">
      <div className="map-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← 一覧に戻る
        </button>
        <select
          className="station-select"
          aria-label="駅でしぼり込む"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        >
          <option value="all">
            すべての駅({gyms.filter((g) => g.lat).length}店)
          </option>
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
        ピンをタップすると店の詳細と候補への追加ができます。
        <br />
        数字はまとまった店の数です。タップで開きます。
      </p>

      <div className="confirm-bar">
        <span className="confirm-count">
          {selectedIds.length >= 2
            ? `${selectedIds.length} 店を候補に`
            : '2店以上えらぶと回せます'}
        </span>
        <button
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={selectedIds.length < 2}
        >
          ルーレットへ進む
        </button>
      </div>
    </section>
  )
}
