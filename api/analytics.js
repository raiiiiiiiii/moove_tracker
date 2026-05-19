import { ALL_RANKS } from '../src/utils/analytics.js'

// Simple helper to get rank from score
function getRank(score) {
  return ALL_RANKS.find(r => score >= r.min && score <= r.max) || ALL_RANKS[ALL_RANKS.length - 1]
}

// Calculate top percentile based on rank and position in that rank
function calculatePercentile(rank, score) {
  let percentile = rank.basePercentile
  const nextRank = ALL_RANKS[ALL_RANKS.indexOf(rank) + 1]
  if (nextRank) {
    const range = nextRank.min - rank.min
    const progress = (score - rank.min) / range
    const percentileRange = nextRank.basePercentile - rank.basePercentile
    percentile = rank.basePercentile + (progress * percentileRange)
  }
  return Math.max(10, Math.min(99.9, Math.round(percentile * 10) / 10))
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { username } = req.query

  if (!username) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_USERNAME',
      message: 'Username parameter is required.'
    })
  }

  const cleanUsername = username.trim().replace(/^@/, '')
  if (!/^[A-Za-z0-9_]{1,15}$/.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_USERNAME',
      message: 'Invalid X username format.'
    })
  }

  const token = process.env.X_BEARER_TOKEN
  if (!token) {
    return res.status(500).json({
      success: false,
      error: 'CONFIGURATION_ERROR',
      message: 'X_BEARER_TOKEN environment variable is not configured on the server.'
    })
  }

  try {
    // 1. Fetch User details by username
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanUsername}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (userRes.status === 401 || userRes.status === 403) {
      return res.status(500).json({
        success: false,
        error: 'API_AUTHENTICATION_FAILED',
        message: 'Unable to authenticate with the X API. Please verify the bearer token.'
      })
    }

    if (userRes.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'X API rate limit reached. Please try again later.'
      })
    }

    const userData = await userRes.json()
    if (!userData.data) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: `X username @${cleanUsername} does not exist.`
      })
    }

    const userId = userData.data.id
    const displayName = userData.data.name

    // 2. Fetch Recent Tweets matching Moove keywords from the user
    // Looks for tweets from the user containing "moove", "moovexyz", or "@moovexyz"
    const searchRes = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=from:${cleanUsername} (moove OR moovexyz OR @moovexyz)&tweet.fields=public_metrics,created_at,in_reply_to_user_id&max_results=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (searchRes.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'X API rate limit reached during search. Please try again later.'
      })
    }

    const searchData = await searchRes.json()
    const tweets = searchData.data || []

    // 3. Process tweets and calculate metrics
    let totalPosts = 0
    let totalReplies = 0
    let totalLikes = 0
    let totalRetweets = 0
    let totalMentions = 0 // Mentions of @moovexyz
    
    // Group weekly data by day
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dailyStats = days.reduce((acc, d) => {
      acc[d] = { posts: 0, replies: 0, likes: 0 }
      return acc
    }, {})

    // Categorization counts
    const categoryCounts = {
      'Ecosystem Updates': 0,
      'Community Support': 0,
      'Product Feedback': 0,
      'General Discussion': 0
    }

    tweets.forEach(tweet => {
      const isReply = !!tweet.in_reply_to_user_id
      const text = tweet.text.toLowerCase()
      const metrics = tweet.public_metrics || {}

      // Count posts vs replies
      if (isReply) {
        totalReplies++
      } else {
        totalPosts++
      }

      if (text.includes('moovexyz') || text.includes('@moovexyz')) {
        totalMentions++
      }

      totalLikes += (metrics.like_count || 0)
      totalRetweets += ((metrics.retweet_count || 0) + (metrics.quote_count || 0))

      // Group by day of week
      const date = new Date(tweet.created_at)
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1] // Adjust Sun (0) to index 6
      if (dailyStats[dayName]) {
        if (isReply) {
          dailyStats[dayName].replies++
        } else {
          dailyStats[dayName].posts++
        }
        dailyStats[dayName].likes += (metrics.like_count || 0)
      }

      // Simple keyword categorization
      if (text.includes('update') || text.includes('announcement') || text.includes('launch') || text.includes('ecosystem')) {
        categoryCounts['Ecosystem Updates']++
      } else if (text.includes('help') || text.includes('support') || text.includes('issues') || text.includes('solve')) {
        categoryCounts['Community Support']++
      } else if (text.includes('feedback') || text.includes('suggest') || text.includes('idea') || text.includes('feature')) {
        categoryCounts['Product Feedback']++
      } else {
        categoryCounts['General Discussion']++
      }
    })

    const totalEngagement = totalPosts + totalReplies + totalLikes + totalRetweets + totalMentions

    // Activity Score calculation
    const activityScore = Math.floor(
      totalPosts    * 8  +
      totalReplies  * 10 +
      totalLikes    * 2  +
      totalRetweets * 6  +
      totalMentions * 5
    )

    const rank = getRank(activityScore)
    const percentile = calculatePercentile(rank, activityScore)

    // Format weeklyData for recharts
    const weeklyData = days.map(day => ({
      day,
      posts: dailyStats[day].posts,
      replies: dailyStats[day].replies,
      likes: dailyStats[day].likes
    }))

    // Format categories
    const totalCategorized = Object.values(categoryCounts).reduce((s, c) => s + c, 0) || 1
    const categories = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      pct: Math.round((count / totalCategorized) * 100)
    }))

    // Calculate next rank details
    let rankProgress = 100
    let nextRankMin = null
    let nextRankName = ''
    const nextRank = ALL_RANKS[ALL_RANKS.indexOf(rank) + 1]
    if (nextRank) {
      nextRankMin = nextRank.min
      nextRankName = nextRank.name
      const range = nextRank.min - rank.min
      rankProgress = Math.min(100, Math.max(0, Math.floor(((activityScore - rank.min) / range) * 100)))
    }

    // Set Cache headers: cache on Vercel CDN for 5 minutes, stale while revalidate for 1 minute
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')

    return res.status(200).json({
      success: true,
      data: {
        username: cleanUsername,
        displayName,
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
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Serverless backend error:', error)
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An internal error occurred while fetching data from X.'
    })
  }
}
