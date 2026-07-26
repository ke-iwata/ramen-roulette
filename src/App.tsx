import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_GYMS, type Gym } from './data/gyms'
import { useLocalStorage } from './hooks/useLocalStorage'
import GymSelector from './components/GymSelector'
import RouletteWheel from './components/RouletteWheel'
import ResultModal from './components/ResultModal'
import MapView from './components/MapView'

type Screen = 'select' | 'roulette' | 'map'

export default function App() {
  const [customGyms, setCustomGyms] = useLocalStorage<Gym[]>('ramen:v2:customShops', [])
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>(
    'ramen:v2:selectedIds',
    DEFAULT_GYMS.map((g) => g.id),
  )
  const [screen, setScreen] = useState<Screen>(() =>
    location.hash === '#/map' ? 'map' : 'select',
  )
  const [candidates, setCandidates] = useState<Gym[]>([])
  const [result, setResult] = useState<Gym | null>(null)
  const [detail, setDetail] = useState<Gym | null>(null)
  const [spinSignal, setSpinSignal] = useState(0)

  // マップ画面は #/map で表示。ブラウザの戻るでも一覧に戻れる
  useEffect(() => {
    const onHash = () => {
      setScreen(location.hash === '#/map' ? 'map' : 'select')
      setDetail(null)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openMap = () => {
    location.hash = '#/map'
    setScreen('map')
  }

  const closeMap = () => {
    if (location.hash === '#/map') history.back()
    else setScreen('select')
  }

  const allGyms = useMemo(() => [...DEFAULT_GYMS, ...customGyms], [customGyms])
  const customGymIds = new Set(customGyms.map((g) => g.id))

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const addGym = (name: string, area: string) => {
    const gym: Gym = { id: `custom-${crypto.randomUUID()}`, name, area }
    setCustomGyms((prev) => [...prev, gym])
    setSelectedIds((prev) => [...prev, gym.id])
  }

  const removeGym = (id: string) => {
    setCustomGyms((prev) => prev.filter((g) => g.id !== id))
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  // 路線・駅単位のまとめて選択/解除
  const setMany = (ids: string[], on: boolean) => {
    setSelectedIds((prev) => {
      if (on) return [...new Set([...prev, ...ids])]
      const drop = new Set(ids)
      return prev.filter((x) => !drop.has(x))
    })
  }

  const confirm = () => {
    const chosen = allGyms.filter((g) => selectedIds.includes(g.id))
    if (chosen.length < 2) return
    setCandidates(chosen)
    setScreen('roulette')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>ラーメンルーレット</h1>
        <p className="tagline">
          江戸川区まわりのラーメン屋から、今日の一杯を決めます
        </p>
        {screen === 'select' && (
          <button className="btn btn-maplink" onClick={openMap}>
            🗺 マップから候補を探す
          </button>
        )}
      </header>

      {screen === 'map' ? (
        <MapView
          gyms={allGyms}
          selectedIds={selectedIds}
          onSelect={setDetail}
          onBack={closeMap}
          onConfirm={() => {
            if (location.hash === '#/map') location.hash = ''
            confirm()
          }}
        />
      ) : screen === 'select' ? (
        <GymSelector
          gyms={allGyms}
          selectedIds={selectedIds}
          onToggle={toggle}
          onSelectAll={() => setSelectedIds(allGyms.map((g) => g.id))}
          onDeselectAll={() => setSelectedIds([])}
          onAddGym={addGym}
          onRemoveGym={removeGym}
          onSetMany={setMany}
          customGymIds={customGymIds}
          onConfirm={confirm}
        />
      ) : (
        <RouletteWheel
          gyms={candidates}
          spinSignal={spinSignal}
          onResult={setResult}
          onBack={() => setScreen('select')}
        />
      )}

      {detail && (
        <ResultModal
          gym={detail}
          lead="この一杯"
          selected={selectedIds.includes(detail.id)}
          onToggleSelect={() => toggle(detail.id)}
          onClose={() => setDetail(null)}
        />
      )}

      {result && (
        <ResultModal
          gym={result}
          onRespin={() => {
            setResult(null)
            setSpinSignal((n) => n + 1)
          }}
          onBack={() => {
            setResult(null)
            setScreen('select')
          }}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
