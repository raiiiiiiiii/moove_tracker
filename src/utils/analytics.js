/**
 * Moove Activity Analytics Engine
 * Generates realistic simulated analytics based on username + activity patterns.
 * Falls back gracefully when live X API is unavailable.
 */

const RANKS = [
  { name: 'Explorer',          min: 0,    max: 199,  color: '#8B9BB4', emoji: '🔍' },
  { name: 'Contributor',       min: 200,  max: 499,  color: '#60A5FA', emoji: '✨' },
  { name: 'Supporter',         min: 500,  max: 999,  color: '#A78BFA', emoji: '💜' },
  { name: 'Builder',           min: 1000, max: 1999, color: '#F59E0B', emoji: '🔨' },
  { name: 'Advocate',          min: 2000, max: 3999, color: '#F97316', emoji: '📣' },
  { name: 'Power Contributor', min: 4000, max: 7999, color: '#EF4444', emoji: '⚡' },
  { name: 'Moove Legend',      min: 8000, max: Infinity, color: '#00E676', emoji: '🏆' },
]

function seededRandom(seed) {
  let h = 0xDEADBEEF ^ seed
  let k = 0x41C64E6D ^ seed
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45D9F3B)
    k = Math.imul(k ^ (k >>> 16), 0x45D9F3B)
    h ^= k
    k ^= h
    return ((h >>> 0) / 4294967296)
  }
}

function hashUsername(username) {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getRank(score) {
  return RANKS.find(r => score >= r.min && score <= r.max) || RANKS[0]
}

export function generateAnalytics(username) {
  const seed = hashUsername(username.toLowerCase())
  const rand = seededRandom(seed)

  // Score tier based on username characteristics
  const len = username.length
  const tierBoost = len > 10 ? 0.7 : len > 6 ? 0.5 : 0.3
  const baseMultiplier = 0.2 + rand() * 0.8 + tierBoost * rand()

  // Core metrics
  const totalPosts       = Math.floor(rand() * 120 * baseMultiplier) + Math.floor(rand() * 30)
  const totalReplies     = Math.floor(rand() * 80  * baseMultiplier) + Math.floor(rand() * 15)
  const totalLikes       = Math.floor(rand() * 500 * baseMultiplier) + Math.floor(rand() * 100)
  const totalRetweets    = Math.floor(rand() * 60  * baseMultiplier) + Math.floor(rand() * 20)
  const totalMentions    = Math.floor(rand() * 40  * baseMultiplier) + Math.floor(rand() * 10)

  const totalEngagement  = totalPosts + totalReplies + totalLikes + totalRetweets + totalMentions

  // Activity score: weighted formula
  const activityScore = Math.floor(
    totalPosts    * 8  +
    totalReplies  * 10 +
    totalLikes    * 2  +
    totalRetweets * 6  +
    totalMentions * 5
  )

  const rank = getRank(activityScore)

  // Percentile
  const maxScore = 10000
  const percentile = Math.min(99, Math.floor((activityScore / maxScore) * 100))

  // Recent activity (last 7 days chart data)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
    return {
      day,
      posts:   Math.floor(rand() * totalPosts   / 4),
      replies: Math.floor(rand() * totalReplies / 4),
      likes:   Math.floor(rand() * totalLikes   / 7),
    }
  })

  // Top post categories
  const categories = [
    { label: 'Ecosystem Updates', pct: Math.floor(rand() * 35 + 20) },
    { label: 'Community Support', pct: Math.floor(rand() * 25 + 15) },
    { label: 'Product Feedback',  pct: Math.floor(rand() * 20 + 10) },
    { label: 'General Discussion',pct: Math.floor(rand() * 15 + 5)  },
  ]
  // normalize to 100
  const total = categories.reduce((s, c) => s + c.pct, 0)
  categories.forEach(c => { c.pct = Math.round((c.pct / total) * 100) })

  return {
    username,
    totalPosts,
    totalReplies,
    totalLikes,
    totalRetweets,
    totalMentions,
    totalEngagement,
    activityScore,
    rank,
    percentile,
    weeklyData,
    categories,
    generatedAt: new Date().toISOString(),
    isSimulated: true,
  }
}

export const ALL_RANKS = RANKS
