import { gymImageUrl, gymMapsUrl, type Gym } from '../data/gyms'

interface Props {
  gym: Gym
  /** 暖簾に出す見出し(ルーレット結果とマップ閲覧で出し分ける) */
  lead?: string
  /** ルーレット結果のときだけ「もう一杯」を出す */
  onRespin?: () => void
  onBack?: () => void
  onClose: () => void
}

// なると(回転する渦巻き)
function Naruto() {
  return (
    <svg className="naruto" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="18" fill="#fff" stroke="#e63946" strokeWidth="2" />
      <path
        d="M20 6 A14 14 0 1 1 6 20 A14 14 0 1 0 34 20 A14 14 0 0 1 20 34 A14 14 0 1 1 34 20"
        fill="none"
        stroke="#e63946"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function ResultModal({
  gym,
  lead = '本日の一杯',
  onRespin,
  onBack,
  onClose,
}: Props) {
  const img = gymImageUrl(gym, 640)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ramen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="noren">
          <span className="noren-text">{lead}</span>
        </div>

        <div className="bowl">
          <div className="steam" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          {img ? (
            <img
              className="bowl-photo"
              src={img}
              alt=""
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
            />
          ) : (
            <div className="bowl-photo bowl-fallback" aria-hidden>
              🍜
            </div>
          )}
        </div>

        <div className="ramen-body">
          <h2 className="ramen-name">
            <Naruto />
            <span>{gym.name}</span>
          </h2>

          <div className="ramen-meta">
            <span className="meta-chip">📍 {gym.area}</span>
            {gym.rating && <span className="meta-chip star">★ {gym.rating}</span>}
            {gym.walk != null && (
              <span className="meta-chip">🚶 駅から徒歩{gym.walk}分</span>
            )}
          </div>

          <a
            className="btn btn-eat"
            href={gymMapsUrl(gym)}
            target="_blank"
            rel="noopener noreferrer"
          >
            いただきます!(Googleマップを開く)
          </a>

          <div className="modal-actions">
            {onRespin && (
              <button className="btn btn-primary" onClick={onRespin}>
                もう一杯まわす
              </button>
            )}
            {onBack ? (
              <button className="btn btn-ghost" onClick={onBack}>
                候補を選び直す
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={onClose}>
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
