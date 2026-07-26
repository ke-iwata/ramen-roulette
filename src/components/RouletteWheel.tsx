import { useRef, useState } from 'react'
import {
  CHAIN_COLORS,
  CUSTOM_CHAIN_COLOR,
  gymImageUrl,
  type Gym,
} from '../data/gyms'

interface Props {
  gyms: Gym[]
  onResult: (gym: Gym) => void
  onBack: () => void
}

const CARD_WIDTH = 200
const SPIN_MS = 5000
// リングに並べる最大枚数。候補が多い場合は演出用に間引く
// (抽選は常に全候補から行い、当選店はリングに必ず含める)
const MAX_RING = 24

function sampleRing(gyms: Gym[]): Gym[] {
  if (gyms.length <= MAX_RING) return gyms
  const shuffled = [...gyms]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, MAX_RING)
}

export default function RouletteWheel({ gyms, onResult, onBack }: Props) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [ring, setRing] = useState<Gym[]>(() => sampleRing(gyms))
  const timerRef = useRef<number | null>(null)

  const n = ring.length
  const step = 360 / n
  // カードが重ならないリング半径(少人数のときは最低値を確保)
  const radius = Math.max(
    260,
    Math.round((CARD_WIDTH / 2 + 20) / Math.tan(Math.PI / n)),
  )

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setWinnerId(null)

    // 抽選は全候補から
    const winner = gyms[Math.floor(Math.random() * gyms.length)]
    let currentRing = ring
    if (!currentRing.some((g) => g.id === winner.id)) {
      currentRing = [...currentRing]
      currentRing[Math.floor(Math.random() * currentRing.length)] = winner
      setRing(currentRing)
    }
    const winnerIndex = currentRing.findIndex((g) => g.id === winner.id)

    // 当選カードが正面(角度0)に来る回転角。常に負方向へ数周させる
    const desired = -winnerIndex * step
    const delta = ((((desired - rotation) % 360) - 360) % 360) || -360
    const extraTurns = 3 + Math.floor(Math.random() * 2)
    const target = rotation + delta - extraTurns * 360

    setRotation(target)

    timerRef.current = window.setTimeout(() => {
      setSpinning(false)
      setWinnerId(winner.id)
      timerRef.current = window.setTimeout(() => onResult(winner), 900)
    }, SPIN_MS + 150)
  }

  return (
    <section className="roulette">
      <div className="stage">
        <div className="stage-noren" aria-hidden>
          <span>ラ</span>
          <span>ー</span>
          <span>メ</span>
          <span>ン</span>
        </div>
        <div className="carousel-viewport">
          <div
            className="carousel-ring"
            style={{
              transform: `translateZ(${-radius}px) rotateY(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.12, 1)`
                : 'none',
            }}
          >
            {ring.map((gym, i) => {
              const img = gymImageUrl(gym)
              const color =
                CHAIN_COLORS[gym.chain ?? ''] ?? CUSTOM_CHAIN_COLOR
              return (
                <div
                  key={gym.id}
                  className={`carousel-card ${winnerId === gym.id ? 'winner' : ''}`}
                  style={{
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    borderColor: color,
                  }}
                >
                  <div className="carousel-media">
                    <span className="carousel-placeholder" aria-hidden>
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
                  </div>
                  <div className="carousel-label">
                    <span className="carousel-name">{gym.name}</span>
                    <span className="carousel-area">
                      {gym.area}
                      {gym.rating && ` ★${gym.rating}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="roulette-actions">
        <button className="btn btn-primary btn-spin" onClick={spin} disabled={spinning}>
          {spinning ? '回転中…' : '回す!'}
        </button>
        <button className="btn btn-ghost" onClick={onBack} disabled={spinning}>
          候補を選び直す
        </button>
      </div>
    </section>
  )
}
