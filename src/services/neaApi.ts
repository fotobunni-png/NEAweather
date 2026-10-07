import {
  HealthCheckResponse,
  PsiData,
  RainfallData,
  RegionKey,
  TemperatureData,
} from '../types/weather';

const API_TEMP_URL = 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature';
const API_RAIN_URL = 'https://api-open.data.gov.sg/v2/real-time/api/rainfall';
const API_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export async function fetchTemperature(): Promise<TemperatureData> {
  try {
    const res = await fetch(API_TEMP_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      stations: json.data?.stations || [],
      readings: json.data?.readings?.[0]?.data || [],
      timestamp: json.data?.readings?.[0]?.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Direct temperature fetch failed, trying proxy...', err);
    const proxyRes = await fetch('/api/weather/all');
    if (!proxyRes.ok) throw err;
    const proxyJson = await proxyRes.json();
    return {
      stations: proxyJson.temperature?.data?.stations || [],
      readings: proxyJson.temperature?.data?.readings?.[0]?.data || [],
      timestamp: proxyJson.temperature?.data?.readings?.[0]?.timestamp || new Date().toISOString(),
    };
  }
}

export async function fetchRainfall(): Promise<RainfallData> {
  try {
    const res = await fetch(API_RAIN_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      stations: json.data?.stations || [],
      readings: json.data?.readings?.[0]?.data || [],
      timestamp: json.data?.readings?.[0]?.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Direct rainfall fetch failed, trying proxy...', err);
    const proxyRes = await fetch('/api/weather/all');
    if (!proxyRes.ok) throw err;
    const proxyJson = await proxyRes.json();
    return {
      stations: proxyJson.rainfall?.data?.stations || [],
      readings: proxyJson.rainfall?.data?.readings?.[0]?.data || [],
      timestamp: proxyJson.rainfall?.data?.readings?.[0]?.timestamp || new Date().toISOString(),
    };
  }
}

export async function fetchPsi(): Promise<PsiData> {
  try {
    const res = await fetch(API_PSI_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const item = json.data?.items?.[0] || {};
    return {
      regionMetadata: json.data?.regionMetadata || [],
      readings: item.readings || {},
      timestamp: item.timestamp || new Date().toISOString(),
      updateTimestamp: item.updatedTimestamp || item.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Direct PSI fetch failed, trying proxy...', err);
    const proxyRes = await fetch('/api/weather/all');
    if (!proxyRes.ok) throw err;
    const proxyJson = await proxyRes.json();
    const item = proxyJson.psi?.data?.items?.[0] || {};
    return {
      regionMetadata: proxyJson.psi?.data?.regionMetadata || [],
      readings: item.readings || {},
      timestamp: item.timestamp || new Date().toISOString(),
      updateTimestamp: item.updatedTimestamp || item.timestamp || new Date().toISOString(),
    };
  }
}

export async function fetchApiHealth(forceRefresh = false): Promise<HealthCheckResponse> {
  const url = forceRefresh ? '/api/health?refresh=true' : '/api/health';
  const res = await fetch(url);
  if (!res.ok && res.status !== 503) {
    throw new Error(`Health check returned status ${res.status}`);
  }
  return await res.json();
}

export interface PsiCategory {
  range: string;
  label: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  badgeColor: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
  activityGeneral: string;
  activityVulnerable: string;
  maskRecommended: boolean;
}

export function getPsiCategory(psiValue: number): PsiCategory {
  if (psiValue <= 50) {
    return {
      range: '0 – 50',
      label: 'Good',
      badgeColor: 'bg-emerald-500 text-white',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-300 dark:border-emerald-700/60',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      description: 'Air quality is satisfactory and poses little or no risk.',
      activityGeneral: 'Normal outdoor activities can be continued.',
      activityVulnerable: 'Normal outdoor activities can be continued.',
      maskRecommended: false,
    };
  }
  if (psiValue <= 100) {
    return {
      range: '51 – 100',
      label: 'Moderate',
      badgeColor: 'bg-blue-500 text-white',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-300 dark:border-blue-700/60',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'Air quality is acceptable. Very sensitive individuals should observe symptoms.',
      activityGeneral: 'Normal outdoor activities can be continued.',
      activityVulnerable: 'Normal activities; sensitive individuals should reduce strenuous exertion.',
      maskRecommended: false,
    };
  }
  if (psiValue <= 200) {
    return {
      range: '101 – 200',
      label: 'Unhealthy',
      badgeColor: 'bg-amber-500 text-white',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-300 dark:border-amber-700/60',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      description: 'Everyone may begin to experience air quality effects. Prolonged exposure not advised.',
      activityGeneral: 'Reduce prolonged or strenuous outdoor physical exertion.',
      activityVulnerable: 'Avoid prolonged or strenuous outdoor physical exertion.',
      maskRecommended: true,
    };
  }
  if (psiValue <= 300) {
    return {
      range: '201 – 300',
      label: 'Very Unhealthy',
      badgeColor: 'bg-rose-600 text-white',
      textColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-300 dark:border-rose-700/60',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      description: 'Health alert: significant increase in respiratory and cardiovascular aggravation.',
      activityGeneral: 'Avoid prolonged or strenuous outdoor physical exertion.',
      activityVulnerable: 'Minimize outdoor activity; stay indoors as much as possible.',
      maskRecommended: true,
    };
  }
  return {
    range: '> 300',
    label: 'Hazardous',
    badgeColor: 'bg-purple-700 text-white',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-300 dark:border-purple-700/60',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    description: 'Emergency health warning: serious risk of respiratory impact for entire population.',
    activityGeneral: 'Minimize outdoor activities; wear N95 mask if outdoors.',
    activityVulnerable: 'Remain indoors; keep windows closed and operate air purifiers.',
    maskRecommended: true,
  };
}

export function getRainCategory(rainfallMm: number) {
  if (rainfallMm <= 0) {
    return {
      level: 'None',
      label: 'No Rain',
      description: 'Dry conditions at this station',
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800',
    };
  }
  if (rainfallMm < 2.0) {
    return {
      level: 'Light',
      label: 'Light Shower',
      description: 'Mild drizzle or brief light sprinkles',
      color: 'text-sky-600 dark:text-sky-300',
      bg: 'bg-sky-100 dark:bg-sky-900/40',
    };
  }
  if (rainfallMm < 10.0) {
    return {
      level: 'Moderate',
      label: 'Moderate Rain',
      description: 'Steady rainfall across the area',
      color: 'text-blue-600 dark:text-blue-300',
      bg: 'bg-blue-100 dark:bg-blue-900/40',
    };
  }
  return {
    level: 'Heavy',
    label: 'Heavy Downpour',
    description: 'Intense tropical rain storm',
    color: 'text-indigo-600 dark:text-indigo-300',
    bg: 'bg-indigo-100 dark:bg-indigo-900/40',
  };
}
