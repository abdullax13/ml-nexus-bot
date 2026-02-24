const axios = require('axios');

async function fetchPlayerStats({ playerId, serverId }) {
  // إذا وفرت API خارجي لاحقاً:
  if (process.env.ML_STATS_API_BASE) {
    const url = `${process.env.ML_STATS_API_BASE.replace(/\/$/, '')}/player`;
    const res = await axios.get(url, { params: { playerId, serverId } });
    return normalize(res.data);
  }

  // Mock (للتأكد إن كل النظام شغال end-to-end)
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

function normalize(data) {
  // عدّلها حسب شكل مزودك الحقيقي لاحقاً
  return {
    rank: data.rank ?? null,
    stars: data.stars ?? null,
    winrate: data.winrate ?? null,
    matches: data.matches ?? null,
    kda: data.kda ?? null,
    topHeroes: data.topHeroes ?? [],
    source: 'api',
  };
}

module.exports = { fetchPlayerStats };
