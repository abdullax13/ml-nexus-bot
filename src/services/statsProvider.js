const axios = require('axios');

function hasValidBase(url) {
  return typeof url === 'string' && url.trim().startsWith('http');
}

async function fetchPlayerStats({ playerId, serverId }) {
  const base = process.env.ML_STATS_API_BASE;

  // ✅ إذا ما فيه API خارجي صالح → رجّع Mock مباشرة
  if (!hasValidBase(base)) {
    return {
      rank: 'Mythic',
      stars: 25,
      winrate: 57.8,
      matches: 812,
      kda: 4.2,
      topHeroes: [
        { name: 'Nolan', wr: 61.2, matches: 120 },
        { name: 'Joy', wr: 58.9, matches: 98 },
        { name: 'Karrie', wr: 55.1, matches: 76 },
      ],
      source: 'mock',
    };
  }

  try {
    const url = `${base.replace(/\/$/, '')}/player`;

    const res = await axios.get(url, {
      params: { playerId, serverId },
      timeout: 10000,
    });

    return {
      rank: res.data.rank ?? null,
      stars: res.data.stars ?? null,
      winrate: res.data.winrate ?? null,
      matches: res.data.matches ?? null,
      kda: res.data.kda ?? null,
      topHeroes: res.data.topHeroes ?? [],
      source: 'api',
    };
  } catch (error) {
    console.error('[statsProvider] API error:', error.message);

    // fallback احتياطي
    return {
      rank: 'Unknown',
      stars: 0,
      winrate: 0,
      matches: 0,
      kda: 0,
      topHeroes: [],
      source: 'fallback',
    };
  }
}

module.exports = { fetchPlayerStats };
