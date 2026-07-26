export interface Gym {
  id: string
  name: string
  area: string
  url?: string
  chain?: string
  instagram?: string
}

// 店舗ページのスクリーンショットをサムネイルとして利用
// (WordPress.com の無料スクリーンショットAPI mshots)
export function gymImageUrl(gym: Gym, width = 480): string | null {
  if (!gym.url) return null
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(gym.url)}?w=${width}`
}

// 駅ごとのアクセントカラー(一覧のグルーピング表示に使用)
export const CHAIN_COLORS: Record<string, string> = {
  新小岩: '#ef476f',
  小岩: '#f7822b',
  平井: '#e0a800',
  錦糸町: '#06a77d',
  亀戸: '#0ca7b0',
  本八幡: '#118ab2',
  葛西: '#4361ee',
  西葛西: '#6a4c93',
  船堀: '#b5179e',
  一之江: '#d1495b',
  篠崎: '#5f6b85',
}

export const CUSTOM_CHAIN = '追加した店'
export const CUSTOM_CHAIN_COLOR = '#5f6b85'

// 江戸川区近辺(総武線・都営新宿線・東西線沿線)の人気ラーメン店
// 2026年7月時点のグルメサイト等の情報をもとに選定
export const DEFAULT_GYMS: Gym[] = [
  // 新小岩
  {
    id: 'shinkoiwa-ittou',
    name: '麺屋一燈',
    area: '新小岩',
    url: 'https://tabelog.com/tokyo/A1312/A131204/13111737/',
    chain: '新小岩',
  },
  {
    id: 'shinkoiwa-tourou',
    name: 'ラーメン燈郎',
    area: '新小岩',
    chain: '新小岩',
  },

  // 小岩
  {
    id: 'koiwa-suppon',
    name: '鼈(月と鼈 小岩店)',
    area: '小岩',
    url: 'https://tabelog.com/tokyo/A1312/A131204/13138997/',
    chain: '小岩',
  },
  {
    id: 'koiwa-edoya',
    name: '麺 えどや',
    area: '小岩',
    url: 'https://tabelog.com/tokyo/A1312/A131204/13045131/',
    chain: '小岩',
  },
  {
    id: 'koiwa-sakutaya',
    name: '横浜家系ラーメン 作田家',
    area: '小岩',
    url: 'https://tabelog.com/tokyo/A1312/A131204/13093723/',
    chain: '小岩',
  },

  // 平井
  {
    id: 'hirai-kokoronoaji',
    name: '心の味製麺 平井店',
    area: '平井',
    chain: '平井',
  },
  {
    id: 'hirai-yanakasou',
    name: 'やなか草',
    area: '平井',
    chain: '平井',
  },

  // 錦糸町
  {
    id: 'kinshicho-mengyo',
    name: '真鯛らーめん 麺魚 本店',
    area: '錦糸町',
    url: 'https://www.mengyo.net/',
    chain: '錦糸町',
  },
  {
    id: 'kinshicho-manchiken',
    name: '中華そば 満鶏軒',
    area: '錦糸町',
    url: 'https://tabelog.com/tokyo/A1312/A131201/13220773/',
    chain: '錦糸町',
  },

  // 亀戸
  {
    id: 'kameido-tsukihi',
    name: '亀戸煮干中華蕎麦つきひ',
    area: '亀戸',
    chain: '亀戸',
  },

  // 本八幡
  {
    id: 'motoyawata-naritake',
    name: 'なりたけ 本八幡店',
    area: '本八幡',
    chain: '本八幡',
  },

  // 葛西
  {
    id: 'kasai-kachofugetsu',
    name: '麺屋永吉 花鳥風月',
    area: '葛西',
    url: 'https://tabelog.com/tokyo/A1313/A131305/13125202/',
    chain: '葛西',
  },
  {
    id: 'kasai-karashiya',
    name: 'らーめん からしや 葛西本店',
    area: '葛西',
    url: 'https://tabelog.com/tokyo/A1313/A131305/13166893/',
    chain: '葛西',
  },

  // 西葛西
  {
    id: 'nishikasai-manriki',
    name: 'スパイス・ラー麺 卍力 西葛西店',
    area: '西葛西',
    chain: '西葛西',
  },
  {
    id: 'nishikasai-h2',
    name: '麺や えいちつー',
    area: '西葛西',
    chain: '西葛西',
  },

  // 船堀
  {
    id: 'funabori-ooshima',
    name: '大島',
    area: '船堀',
    url: 'https://ooshima-funabori.com/',
    chain: '船堀',
  },

  // 一之江
  {
    id: 'ichinoe-toukanya',
    name: 'らーめん とうかんや',
    area: '一之江',
    chain: '一之江',
  },

  // 篠崎
  {
    id: 'shinozaki-bushido',
    name: '麺屋 武士道 篠崎店',
    area: '篠崎',
    chain: '篠崎',
  },
]
