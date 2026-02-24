const axios = require('axios');

function hasValidBase(url) {
  return typeof url === 'string' && url.trim().startsWith('http');
}

function base() {
  return process.env.ML_HERO_API_BASE;
}

async function getTopMeta({ role = 'all' } = {}) {
  const b = base();

  // ✅ إذا غير مفعل → لا تحاول axios
  if (!hasValidBase(b)) {
    return { ok: false, reason: 'ML_HERO_API_BASE not set' };
  }

  try {
    const url = `${b.replace(/\/$/, '')}/meta/top`;

    const res = await axios.get(url, {
      params: { role },
      timeout: 10000,
    });

    return { ok: true, data: res.data };
  } catch (error) {
    console.error('[heroMetaProvider:getTopMeta]', error.message);
    return { ok: false, reason: 'API error' };
  }
}

async function getCounter(heroName) {
  const b = base();

  // ✅ إذا غير مفعل → لا تحاول axios
  if (!hasValidBase(b)) {
    return { ok: false, reason: 'ML_HERO_API_BASE not set' };
  }

  try {
    const url = `${b.replace(/\/$/, '')}/hero/counter`;

    const res = await axios.get(url, {
      params: { hero: heroName },
      timeout: 10000,
    });

    return { ok: true, data: res.data };
  } catch (error) {
    console.error('[heroMetaProvider:getCounter]', error.message);
    return { ok: false, reason: 'API error' };
  }
}

module.exports = { getTopMeta, getCounter };
