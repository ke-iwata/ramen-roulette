import { gymImageUrl, gymMapsUrl, type Gym } from '../data/gyms'

interface Props {
  gym: Gym
  onRespin: () => void
  onBack: () => void
  onClose: () => void
}

export default function ResultModal({ gym, onRespin, onBack, onClose }: Props) {
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
        <p className="modal-area">
          📍 {gym.area}
          {gym.rating && <span className="modal-rating">★ {gym.rating}</span>}
        </p>
        <div className="modal-links">
          <a
            className="btn btn-outline"
            href={gymMapsUrl(gym)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Googleマップで見る(営業時間・公式情報)
          </a>
          {gym.url && (
            <a
              className="btn btn-outline"
              href={gym.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              お店のページ
            </a>
          )}
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
