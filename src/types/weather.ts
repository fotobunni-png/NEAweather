export interface StationLocation {
  latitude: number;
  longitude: number;
}

export interface WeatherStation {
  id: string;
  deviceId?: string;
  name: string;
  location: StationLocation;
  distanceKm?: number;
}

export interface ReadingItem {
  stationId: string;
  value: number;
}

export interface TemperatureData {
  stations: WeatherStation[];
  readings: ReadingItem[];
  timestamp: string;
}

export interface RainfallData {
  stations: WeatherStation[];
  readings: ReadingItem[];
  timestamp: string;
}

export type RegionKey = 'west' | 'east' | 'central' | 'south' | 'north' | 'national';

export interface PsiReadings {
  co_eight_hour_max?: Record<RegionKey, number>;
  co_sub_index?: Record<RegionKey, number>;
  no2_one_hour_max?: Record<RegionKey, number>;
  o3_eight_hour_max?: Record<RegionKey, number>;
  o3_sub_index?: Record<RegionKey, number>;
  pm10_sub_index?: Record<RegionKey, number>;
  pm10_twenty_four_hourly?: Record<RegionKey, number>;
  pm25_sub_index?: Record<RegionKey, number>;
  pm25_twenty_four_hourly?: Record<RegionKey, number>;
  psi_twenty_four_hourly?: Record<RegionKey, number>;
  so2_sub_index?: Record<RegionKey, number>;
  so2_twenty_four_hourly?: Record<RegionKey, number>;
}

export interface RegionMetadata {
  name: RegionKey;
  labelLocation: StationLocation;
}

export interface PsiData {
  regionMetadata: RegionMetadata[];
  readings: PsiReadings;
  timestamp: string;
  updateTimestamp: string;
}

export interface ApiEndpointHealth {
  id: string;
  name: string;
  endpoint: string;
  description?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  statusCode: number;
  latencyMs: number;
  healthy: boolean;
  stationCount?: number;
  recordsCount?: number;
  dataTimestamp?: string | null;
  message?: string;
  lastCheck: string;
}

export interface HealthCheckResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  averageLatencyMs: number;
  allHealthy: boolean;
  apis: ApiEndpointHealth[];
  cached?: boolean;
  cacheAgeSeconds?: number;
}

export type WeatherEffectMode = 'auto' | 'sunny' | 'raining' | 'hazy';

export interface LocationSelection {
  type: 'auto-gps' | 'preset-town' | 'region' | 'station';
  name: string;
  latitude: number;
  longitude: number;
  region: RegionKey;
  nearestTempStation?: WeatherStation;
  nearestRainStation?: WeatherStation;
  distanceKm?: number;
}
