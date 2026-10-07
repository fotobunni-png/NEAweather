/**
 * API Health Check module for NEA / Data.gov.sg real-time APIs
 * Endpoints monitored:
 * - https://api-open.data.gov.sg/v2/real-time/api/air-temperature
 * - https://api-open.data.gov.sg/v2/real-time/api/rainfall
 * - https://api-open.data.gov.sg/v2/real-time/api/psi
 */

export const MONITORED_APIS = [
  {
    id: 'air-temperature',
    name: 'Air Temperature API',
    endpoint: 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
    description: 'Hourly / minutely real-time ambient temperature by NEA weather stations',
  },
  {
    id: 'rainfall',
    name: 'Rainfall API',
    endpoint: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
    description: '5-minute real-time precipitation measurements across 80+ Singapore stations',
  },
  {
    id: 'psi',
    name: 'Pollutant Standards Index (PSI)',
    endpoint: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
    description: '24-hour PSI, PM2.5, PM10 and sub-indices for North, South, East, West, Central',
  },
];

let cachedResult = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds cache to prevent flooding external API

/**
 * Checks a single endpoint and measures latency and payload sanity
 */
export async function checkEndpoint(api) {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(api.endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SG-Weather-HealthCheck/1.0',
      },
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        id: api.id,
        name: api.name,
        endpoint: api.endpoint,
        status: 'DOWN',
        statusCode: res.status,
        latencyMs,
        healthy: false,
        message: `HTTP ${res.status} ${res.statusText}`,
        lastCheck: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const code = data?.code;
    const isPayloadValid = code === 0 && Boolean(data?.data);

    let stationCount = 0;
    let recordsCount = 0;
    let dataTimestamp = null;

    if (api.id === 'air-temperature' || api.id === 'rainfall') {
      stationCount = data?.data?.stations?.length || 0;
      recordsCount = data?.data?.readings?.[0]?.data?.length || 0;
      dataTimestamp = data?.data?.readings?.[0]?.timestamp || null;
    } else if (api.id === 'psi') {
      const regionMetadata = data?.data?.regionMetadata || [];
      stationCount = regionMetadata.length;
      recordsCount = Object.keys(data?.data?.items?.[0]?.readings || {}).length;
      dataTimestamp = data?.data?.items?.[0]?.timestamp || null;
    }

    return {
      id: api.id,
      name: api.name,
      endpoint: api.endpoint,
      description: api.description,
      status: isPayloadValid ? 'HEALTHY' : 'DEGRADED',
      statusCode: res.status,
      latencyMs,
      healthy: isPayloadValid,
      code,
      stationCount,
      recordsCount,
      dataTimestamp,
      lastCheck: new Date().toISOString(),
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      id: api.id,
      name: api.name,
      endpoint: api.endpoint,
      status: 'DOWN',
      statusCode: 0,
      latencyMs,
      healthy: false,
      message: err instanceof Error ? err.message : String(err),
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Health check handler that evaluates all 3 NEA APIs
 */
export async function getHealthStatus(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedResult && (now - lastCheckTime < CACHE_TTL_MS)) {
    return {
      ...cachedResult,
      cached: true,
      cacheAgeSeconds: Math.round((now - lastCheckTime) / 1000),
    };
  }

  const results = await Promise.all(MONITORED_APIS.map(api => checkEndpoint(api)));

  const allHealthy = results.every(r => r.healthy);
  const anyHealthy = results.some(r => r.healthy);
  const overallStatus = allHealthy ? 'HEALTHY' : anyHealthy ? 'DEGRADED' : 'DOWN';
  const averageLatencyMs = Math.round(
    results.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / results.length
  );

  const payload = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    averageLatencyMs,
    allHealthy,
    apis: results,
    cached: false,
    environment: {
      runtime: 'Node.js',
      app: 'SG Weather & PSI Monitor',
    },
  };

  cachedResult = payload;
  lastCheckTime = now;
  return payload;
}

export default async function handler(req, res) {
  const forceRefresh = req?.query?.refresh === 'true' || req?.query?.force === 'true';
  const healthData = await getHealthStatus(forceRefresh);
  const httpCode = healthData.status === 'DOWN' ? 503 : 200;

  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(httpCode).json(healthData);
  }
  return healthData;
}
