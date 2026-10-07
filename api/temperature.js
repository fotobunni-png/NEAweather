/**
 * API route handler for Singapore Air Temperature
 * Proxies and formats real-time NEA temperature data
 * Source: https://api-open.data.gov.sg/v2/real-time/api/air-temperature
 */

const ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature';

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache

export async function getTemperatureData(forceRefresh = false) {
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
    throw new Error(`NEA Temperature API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  const stations = json.data?.stations || [];
  const readings = json.data?.readings?.[0]?.data || [];
  const timestamp = json.data?.readings?.[0]?.timestamp || new Date().toISOString();

  const values = readings.map(r => r.value).filter(v => typeof v === 'number');
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;
  const average = values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null;

  const result = {
    endpoint: ENDPOINT,
    timestamp,
    fetchedAt: new Date().toISOString(),
    stationsCount: stations.length,
    stations,
    readings,
    stats: {
      min,
      max,
      average,
      unit: '°C',
    },
    cached: false,
  };

  cache = result;
  cacheTime = now;
  return result;
}

export default async function handler(req, res) {
  try {
    const force = req?.query?.refresh === 'true';
    const data = await getTemperatureData(force);

    // Optional station filter: ?station=S109
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
        error: 'Failed to fetch temperature data',
        message: err instanceof Error ? err.message : String(err),
      });
    }
    throw err;
  }
}
