/**
 * Moove Activity Analytics Engine
 * Generates realistic simulated analytics based on username + activity patterns.
 * Falls back gracefully when live X API is unavailable.
 */

const RANKS = [
  { name: 'Explorer',          min: 0,    max: 199,  color: '#8B9BB4', emoji: '🔍', basePercentile: 50 },
  { name: 'Contributor',       min: 200,  max: 499,  color: '#60A5FA', emoji: '✨', basePercentile: 75 },
  { name: 'Supporter',         min: 500,  max: 999,  color: '#A78BFA', emoji: '💜', basePercentile: 88 },
  { name: 'Builder',           min: 1000, max: 1999, color: '#F59E0B', emoji: '🔨', basePercentile: 94 },
  { name: 'Advocate',          min: 2000, max: 3999, color: '#F97316', emoji: '📣', basePercentile: 97.5 },
  { name: 'Power Contributor', min: 4000, max: 7999, color: '#EF4444', emoji: '⚡', basePercentile: 99.2 },
  { name: 'Moove Legend',      min: 8000, max: Infinity, color: '#FFD600', emoji: '🏆', basePercentile: 99.9 },
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
  return RANKS.find(r => score >= r.min && score <= r.max) || RANKS[RANKS.length - 1]
}

export function generateAnalytics(username) {
  const seed = hashUsername(username.toLowerCase())
  const rand = seededRandom(seed)

  // 1. Establish a realistic base activity scale (1 to 100) based on seed
  // Username length and character distribution affect their core activity levels
  const baseScale = 5 + (seed % 95) + Math.floor(rand() * 10)

  // 2. Generate proportional metrics based on the baseScale
  // Ensures likes are always a multiple of posts/replies, retweets are proportional, etc.
  const totalPosts    = Math.max(1, Math.floor(baseScale * (0.8 + rand() * 0.6)))
  const totalReplies  = Math.max(1, Math.floor(totalPosts * (0.4 + rand() * 0.8)))
  const totalLikes    = Math.max(10, Math.floor((totalPosts + totalReplies) * (4.5 + rand() * 9.5)))
  const totalRetweets = Math.floor(totalPosts * (0.2 + rand() * 0.4))
  const totalMentions = Math.floor(totalPosts * (0.3 + rand() * 0.5))

  const totalEngagement = totalPosts + totalReplies + totalLikes + totalRetweets + totalMentions

  // 3. Activity Score (weighted formula matching dashboard weights)
  const activityScore = Math.floor(
    totalPosts    * 8  +
    totalReplies  * 10 +
    totalLikes    * 2  +
    totalRetweets * 6  +
    totalMentions * 5
  )

  const rank = getRank(activityScore)

  // 4. Calculate a realistic top percentile based on rank and position in that rank
  // Ensures people in Builder/Advocate/Legend ranks display as Top 5%, Top 1%, etc.
  let percentile = rank.basePercentile
  let rankProgress = 100
  let nextRankMin = null
  let nextRankName = ''

  const nextRank = RANKS[RANKS.indexOf(rank) + 1]
  if (nextRank) {
    nextRankMin = nextRank.min
    nextRankName = nextRank.name
    const range = nextRank.min - rank.min
    const progress = (activityScore - rank.min) / range
    const percentileRange = nextRank.basePercentile - rank.basePercentile
    percentile = rank.basePercentile + (progress * percentileRange)
    rankProgress = Math.min(100, Math.max(0, Math.floor(progress * 100)))
  }
  // Clamp percentile
  percentile = Math.max(10, Math.min(99.9, Math.round(percentile * 10) / 10))

  // 5. Mathematically distribute total metrics over 7 days for the chart
  // Sum of weeklyData.posts/replies/likes matches the total exactly
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Generate 7 raw weights
  const rawWeights = Array.from({ length: 7 }, () => 0.1 + rand() * 0.9)
  const totalWeight = rawWeights.reduce((s, w) => s + w, 0)
  const normalizedWeights = rawWeights.map(w => w / totalWeight)

  let postsPlaced = 0
  let repliesPlaced = 0
  let likesPlaced = 0

  const weeklyData = days.map((day, idx) => {
    const weight = normalizedWeights[idx]
    
    // Distribute proportionally
    let dayPosts = Math.round(totalPosts * weight)
    let dayReplies = Math.round(totalReplies * weight)
    let dayLikes = Math.round(totalLikes * weight)

    // Keep track of what we've allocated
    postsPlaced += dayPosts
    repliesPlaced += dayReplies
    likesPlaced += dayLikes

    // On the last day, adjust for rounding errors to make the sum match exactly
    if (idx === 6) {
      dayPosts += (totalPosts - postsPlaced)
      dayReplies += (totalReplies - repliesPlaced)
      dayLikes += (totalLikes - likesPlaced)
      
      // Ensure no negative values due to adjustments
      dayPosts = Math.max(0, dayPosts)
      dayReplies = Math.max(0, dayReplies)
      dayLikes = Math.max(0, dayLikes)
    }

    return {
      day,
      posts: dayPosts,
      replies: dayReplies,
      likes: dayLikes
    }
  })

  // 6. Distribution categories (adds up to 100%)
  const categories = [
    { label: 'Ecosystem Updates', pct: Math.floor(rand() * 30 + 20) },
    { label: 'Community Support', pct: Math.floor(rand() * 20 + 15) },
    { label: 'Product Feedback',  pct: Math.floor(rand() * 15 + 10) },
    { label: 'General Discussion',pct: Math.floor(rand() * 15 + 5)  },
  ]
  const catSum = categories.reduce((s, c) => s + c.pct, 0)
  let catPercentagePlaced = 0
  categories.forEach((c, idx) => {
    if (idx === categories.length - 1) {
      c.pct = 100 - catPercentagePlaced
    } else {
      c.pct = Math.round((c.pct / catSum) * 100)
      catPercentagePlaced += c.pct
    }
  })

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
    nextRankMin,
    nextRankName,
    rankProgress,
    generatedAt: new Date().toISOString(),
    isSimulated: true,
  }
}

export const ALL_RANKS = RANKS

