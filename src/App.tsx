import { useState } from 'react'
import { DEFAULT_GYMS, type Gym } from './data/gyms'
import { useLocalStorage } from './hooks/useLocalStorage'
import GymSelector from './components/GymSelector'
import RouletteWheel from './components/RouletteWheel'
import ResultModal from './components/ResultModal'

type Screen = 'select' | 'roulette'

export default function App() {
  const [customGyms, setCustomGyms] = useLocalStorage<Gym[]>('ramen:v1:customShops', [])
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>(
    'ramen:v1:selectedIds',
    DEFAULT_GYMS.map((g) => g.id),
  )
  const [screen, setScreen] = useState<Screen>('select')
  const [candidates, setCandidates] = useState<Gym[]>([])
  const [result, setResult] = useState<Gym | null>(null)

  const allGyms = [...DEFAULT_GYMS, ...customGyms]
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
        <p className="tagline">江戸川区近辺のラーメン屋をルーレットで決めよう</p>
      </header>

      {screen === 'select' ? (
        <GymSelector
          gyms={allGyms}
          selectedIds={selectedIds}
          onToggle={toggle}
          onSelectAll={() => setSelectedIds(allGyms.map((g) => g.id))}
          onDeselectAll={() => setSelectedIds([])}
          onAddGym={addGym}
          onRemoveGym={removeGym}
          customGymIds={customGymIds}
          onConfirm={confirm}
        />
      ) : (
        <RouletteWheel
          gyms={candidates}
          onResult={setResult}
          onBack={() => setScreen('select')}
        />
      )}

      {result && (
        <ResultModal
          gym={result}
          onRespin={() => setResult(null)}
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
