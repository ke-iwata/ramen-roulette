import { useState, type CSSProperties } from 'react'
import {
  CHAIN_COLORS,
  CUSTOM_CHAIN,
  CUSTOM_CHAIN_COLOR,
  LINES,
  gymImageUrl,
  type Gym,
} from '../data/gyms'

interface Props {
  gyms: Gym[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onAddGym: (name: string, area: string) => void
  onRemoveGym: (id: string) => void
  onSetMany: (ids: string[], selected: boolean) => void
  customGymIds: Set<string>
  onConfirm: () => void
}

interface Group {
  line: string
  color: string
  stations: { station: string; gyms: Gym[] }[]
}

export default function GymSelector({
  gyms,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onAddGym,
  onRemoveGym,
  onSetMany,
  customGymIds,
  onConfirm,
}: Props) {
  const [newName, setNewName] = useState('')
  const [newArea, setNewArea] = useState('')
  const [openLines, setOpenLines] = useState<Set<string>>(
    () => new Set(LINES.map((l) => l.name)),
  )
  const [openStations, setOpenStations] = useState<Set<string>>(() => new Set())

  const selected = new Set(selectedIds)
  const canConfirm = selectedIds.length >= 2

  // 路線 → 駅 の順にグルーピング。どの路線にも属さない駅と追加店は「その他」へ
  const byStation = new Map<string, Gym[]>()
  for (const gym of gyms) {
    const key = gym.chain ?? CUSTOM_CHAIN
    const list = byStation.get(key)
    if (list) list.push(gym)
    else byStation.set(key, [gym])
  }

  const groups: Group[] = []
  const used = new Set<string>()
  for (const line of LINES) {
    const stations = line.stations
      .filter((s) => byStation.has(s))
      .map((s) => {
        used.add(s)
        return { station: s, gyms: byStation.get(s)! }
      })
    if (stations.length) groups.push({ ...line, line: line.name, stations })
  }
  const leftovers = [...byStation.keys()].filter((s) => !used.has(s))
  if (leftovers.length) {
    groups.push({
      line: 'その他',
      color: CUSTOM_CHAIN_COLOR,
      stations: leftovers.map((s) => ({ station: s, gyms: byStation.get(s)! })),
    })
  }

  const toggleSet = (
    set: Set<string>,
    setter: (s: Set<string>) => void,
    key: string,
  ) => {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setter(next)
  }

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAddGym(name, newArea.trim())
    setNewName('')
    setNewArea('')
  }

  return (
    <section className="selector">
      <div className="selector-header">
        <h2>ラーメン屋候補を選ぶ</h2>
        <div className="selector-actions">
          <button className="btn btn-ghost" onClick={onSelectAll}>
            すべて選択
          </button>
          <button className="btn btn-ghost" onClick={onDeselectAll}>
            すべて解除
          </button>
        </div>
      </div>

      {groups.map((group) => {
        const lineGyms = group.stations.flatMap((s) => s.gyms)
        const lineCount = lineGyms.filter((g) => selected.has(g.id)).length
        const lineOpen = openLines.has(group.line)
        return (
          <div
            key={group.line}
            className="line-section"
            style={{ '--chain': group.color } as CSSProperties}
          >
            <div className="line-header">
              <button
                type="button"
                className="line-toggle"
                aria-expanded={lineOpen}
                onClick={() => toggleSet(openLines, setOpenLines, group.line)}
              >
                <span className={`caret ${lineOpen ? 'open' : ''}`} aria-hidden>
                  ▶
                </span>
                <span className="line-name">{group.line}</span>
                <span className="line-count">
                  {lineCount}/{lineGyms.length}
                </span>
              </button>
              <span className="group-actions">
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() =>
                    onSetMany(
                      lineGyms.map((g) => g.id),
                      lineCount < lineGyms.length,
                    )
                  }
                >
                  {lineCount < lineGyms.length ? '全選択' : '全解除'}
                </button>
              </span>
            </div>

            {lineOpen &&
              group.stations.map(({ station, gyms: stationGyms }) => {
                const key = `${group.line}/${station}`
                const count = stationGyms.filter((g) => selected.has(g.id)).length
                const open = openStations.has(key)
                const color = CHAIN_COLORS[station] ?? CUSTOM_CHAIN_COLOR
                return (
                  <div
                    key={key}
                    className="station-section"
                    style={{ '--chain': color } as CSSProperties}
                  >
                    <div className="station-header">
                      <button
                        type="button"
                        className="station-toggle"
                        aria-expanded={open}
                        onClick={() =>
                          toggleSet(openStations, setOpenStations, key)
                        }
                      >
                        <span
                          className={`caret ${open ? 'open' : ''}`}
                          aria-hidden
                        >
                          ▶
                        </span>
                        <span className="chain-dot" aria-hidden />
                        <span className="chain-name">{station}</span>
                        <span className="chain-count">
                          {count}/{stationGyms.length}
                        </span>
                      </button>
                      <span className="group-actions">
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() =>
                            onSetMany(
                              stationGyms.map((g) => g.id),
                              count < stationGyms.length,
                            )
                          }
                        >
                          {count < stationGyms.length ? '全選択' : '全解除'}
                        </button>
                      </span>
                    </div>

                    {open && (
                      <div className="card-grid">
                        {stationGyms.map((gym) => {
                          const checked = selected.has(gym.id)
                          const img = gymImageUrl(gym)
                          return (
                            <button
                              key={gym.id}
                              type="button"
                              className={`gym-card ${checked ? 'checked' : ''}`}
                              aria-pressed={checked}
                              onClick={() => onToggle(gym.id)}
                            >
                              <span className="card-media">
                                <span className="card-placeholder" aria-hidden>
                                  {gym.name.charAt(0)}
                                </span>
                                {img && (
                                  <img
                                    src={img}
                                    alt=""
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                )}
                                <span className="card-check" aria-hidden>
                                  ✓
                                </span>
                                {customGymIds.has(gym.id) && (
                                  <span
                                    className="card-remove"
                                    role="button"
                                    title="この店を削除"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onRemoveGym(gym.id)
                                    }}
                                  >
                                    ×
                                  </span>
                                )}
                              </span>
                              <span className="card-body">
                                <span className="card-name">{gym.name}</span>
                                <span className="card-area">
                                  {gym.area}
                                  {gym.rating && (
                                    <span className="card-rating">
                                      ★ {gym.rating}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )
      })}

      <div className="add-gym">
        <input
          type="text"
          placeholder="店名を追加(例: 近所の名店)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="text"
          className="add-gym-area"
          placeholder="エリア(任意)"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn" onClick={handleAdd} disabled={!newName.trim()}>
          追加
        </button>
      </div>

      <div className="confirm-bar">
        <span className="confirm-count">{selectedIds.length} 件選択中</span>
        <button className="btn btn-primary" onClick={onConfirm} disabled={!canConfirm}>
          {canConfirm ? '候補を確定してルーレットへ' : '2件以上選んでください'}
        </button>
      </div>
    </section>
  )
}
