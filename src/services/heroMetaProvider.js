const axios = require('axios');

function base() {
  return process.env.ML_HERO_API_BASE
    ? process.env.ML_HERO_API_BASE.replace(/\/$/, '')
    : null;
}

async function getTopMeta({ role = 'all' } = {}) {
  const b = base();
  if (!b) return { ok: false, reason: 'ML_HERO_API_BASE not set' };

  // ملاحظة: المسارات تختلف حسب الـ API اللي بتختاره. هذا مثال عام.
  // عدّل endpoints لاحقاً حسب مزودك.
  const res = await axios.get(`${b}/meta/top`, { params: { role } });
  return { ok: true, data: res.data };
}

async function getCounter(heroName) {
  const b = base();
  if (!b) return { ok: false, reason: 'ML_HERO_API_BASE not set' };

  const res = await axios.get(`${b}/hero/counter`, { params: { hero: heroName } });
  return { ok: true, data: res.data };
}

module.exports = { getTopMeta, getCounter };
