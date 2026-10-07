/**
 * API route handler for Singapore Rainfall
 * Proxies and formats 5-minute real-time NEA rainfall data
 * Source: https://api-open.data.gov.sg/v2/real-time/api/rainfall
 */

const ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/rainfall';

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache

export async function getRainfallData(forceRefresh = false) {
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
    throw new Error(`NEA Rainfall API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  const stations = json.data?.stations || [];
  const readings = json.data?.readings?.[0]?.data || [];
  const timestamp = json.data?.readings?.[0]?.timestamp || new Date().toISOString();

  const activeRainStations = readings.filter(r => (r.value || 0) > 0);
  const values = readings.map(r => r.value).filter(v => typeof v === 'number');
  const max = values.length ? Math.max(...values) : 0;

  const result = {
    endpoint: ENDPOINT,
    timestamp,
    fetchedAt: new Date().toISOString(),
    stationsCount: stations.length,
    activeRainCount: activeRainStations.length,
    maxRainfallMm: max,
    stations,
    readings,
    cached: false,
  };

  cache = result;
  cacheTime = now;
  return result;
}

export default async function handler(req, res) {
  try {
    const force = req?.query?.refresh === 'true';
    const data = await getRainfallData(force);

    // Optional station filter: ?station=S218
    const stationId = req?.query?.station;
    if (stationId && typeof stationId === 'string') {
      const station = data.stations.find(s => s.id.toLowerCase() === stationId.toLowerCase());
      const reading = data.readings.find(r => r.stationId.toLowerCase() === stationId.toLowerCase());
      return res.json({
        station: station || null,
        reading: reading || null,
        timestamp: data.timestamp,
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
        error: 'Failed to fetch rainfall data',
        message: err instanceof Error ? err.message : String(err),
      });
    }
    throw err;
  }
}
