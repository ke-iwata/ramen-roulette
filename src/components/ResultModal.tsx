import { gymImageUrl, type Gym } from '../data/gyms'

interface Props {
  gym: Gym
  onRespin: () => void
  onBack: () => void
  onClose: () => void
}

export default function ResultModal({ gym, onRespin, onBack, onClose }: Props) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${gym.name} ${gym.area}`,
  )}`
  const img = gymImageUrl(gym, 640)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {img && (
          <div className="modal-media">
            <img
              src={img}
              alt=""
              onError={(e) => {
                e.currentTarget.parentElement!.style.display = 'none'
              }}
            />
          </div>
        )}
        <p className="modal-lead">🍜 今日のラーメンは…</p>
        <p className="modal-gym">{gym.name}</p>
        {gym.area && <p className="modal-area">📍 {gym.area}</p>}
        <div className="modal-links">
          {gym.url && (
            <a
              className="btn btn-outline"
              href={gym.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {gym.url.includes('tabelog.com') ? '食べログ' : '公式サイト'}
            </a>
          )}
          {gym.instagram && (
            <a
              className="btn btn-outline"
              href={`https://www.instagram.com/${gym.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          )}
          <a
            className="btn btn-outline"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            営業時間・料金 (Googleマップ)
          </a>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onRespin}>
            もう一度回す
          </button>
          <button className="btn btn-ghost" onClick={onBack}>
            候補を選び直す
          </button>
        </div>
      </div>
    </div>
  )
}
