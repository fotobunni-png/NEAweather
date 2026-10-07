/**
 * API route handler for Singapore Pollutant Standards Index (PSI)
 * Proxies and formats real-time NEA 24-hr PSI, PM2.5, PM10 data
 * Source: https://api-open.data.gov.sg/v2/real-time/api/psi
 */

const ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache

export async function getPsiData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache && (now - cacheTime < CACHE_TTL)) {
    return { ...cache, cached: true };
  }

  const res = await fetch(ENDPOINT, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'SG-Weather-Monitor/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`NEA PSI API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  const regionMetadata = json.data?.regionMetadata || [];
  const item = json.data?.items?.[0] || {};
  const readings = item.readings || {};
  const timestamp = item.timestamp || new Date().toISOString();
  const updateTimestamp = item.updatedTimestamp || item.timestamp || timestamp;

  const result = {
    endpoint: ENDPOINT,
    timestamp,
    updateTimestamp,
    fetchedAt: new Date().toISOString(),
    regions: regionMetadata.map(r => r.name),
    regionMetadata,
    readings,
    psi24Hourly: readings.psi_twenty_four_hourly || {},
    pm2524Hourly: readings.pm25_twenty_four_hourly || {},
    cached: false,
  };

  cache = result;
  cacheTime = now;
  return result;
}

export default async function handler(req, res) {
  try {
    const force = req?.query?.refresh === 'true';
    const data = await getPsiData(force);

    // Optional region filter: ?region=west
    const region = req?.query?.region;
    if (region && typeof region === 'string') {
      const regLower = region.toLowerCase();
      const regionPsi = data.psi24Hourly[regLower] ?? data.psi24Hourly.national ?? null;
      const regionPm25 = data.pm2524Hourly[regLower] ?? data.pm2524Hourly.national ?? null;

      return res.json({
        region: regLower,
        psi: regionPsi,
        pm25: regionPm25,
        updatedAt: data.updateTimestamp,
      });
    }

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(data);
    }
    return data;
  } catch (err) {
    if (res && typeof res.status === 'function') {
      return res.status(502).json({
        error: 'Failed to fetch PSI data',
        message: err instanceof Error ? err.message : String(err),
      });
    }
    throw err;
  }
}
