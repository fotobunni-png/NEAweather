import { RegionKey, StationLocation, WeatherStation } from '../types/weather';

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export const SINGAPORE_REGIONS: Record<
  RegionKey,
  { name: string; label: string; location: StationLocation; description: string }
> = {
  central: {
    name: 'central',
    label: 'Central',
    location: { latitude: 1.35735, longitude: 103.82 },
    description: 'Bishan, Toa Payoh, Newton, Orchard, Marina Bay',
  },
  north: {
    name: 'north',
    label: 'North',
    location: { latitude: 1.41803, longitude: 103.82 },
    description: 'Woodlands, Yishun, Sembawang, Admiralty',
  },
  south: {
    name: 'south',
    label: 'South',
    location: { latitude: 1.29587, longitude: 103.82 },
    description: 'Sentosa, Telok Blangah, Harbourfront, Marina South',
  },
  east: {
    name: 'east',
    label: 'East',
    location: { latitude: 1.35735, longitude: 103.94 },
    description: 'Changi, Bedok, Tampines, Pasir Ris, Paya Lebar',
  },
  west: {
    name: 'west',
    label: 'West',
    location: { latitude: 1.35735, longitude: 103.7 },
    description: 'Jurong, Clementi, Boon Lay, Tuas, Bukit Batok',
  },
  national: {
    name: 'national',
    label: 'Singapore (National)',
    location: { latitude: 1.3521, longitude: 103.8198 },
    description: 'Island-wide Overall Average',
  },
};

export interface SingaporeTown {
  id: string;
  name: string;
  region: RegionKey;
  location: StationLocation;
}

export const SINGAPORE_TOWNS: SingaporeTown[] = [
  { id: 'orchard', name: 'Orchard / Somerset', region: 'central', location: { latitude: 1.3048, longitude: 103.8318 } },
  { id: 'marina-bay', name: 'Marina Bay / Downtown', region: 'south', location: { latitude: 1.2847, longitude: 103.8587 } },
  { id: 'jurong-east', name: 'Jurong East', region: 'west', location: { latitude: 1.3329, longitude: 103.7436 } },
  { id: 'woodlands', name: 'Woodlands', region: 'north', location: { latitude: 1.4382, longitude: 103.7891 } },
  { id: 'tampines', name: 'Tampines', region: 'east', location: { latitude: 1.3526, longitude: 103.9447 } },
  { id: 'ang-mo-kio', name: 'Ang Mo Kio', region: 'central', location: { latitude: 1.3691, longitude: 103.8454 } },
  { id: 'bedok', name: 'Bedok', region: 'east', location: { latitude: 1.3236, longitude: 103.9273 } },
  { id: 'changi', name: 'Changi Airport', region: 'east', location: { latitude: 1.3644, longitude: 103.9915 } },
  { id: 'clementi', name: 'Clementi', region: 'west', location: { latitude: 1.3162, longitude: 103.7649 } },
  { id: 'yishun', name: 'Yishun', region: 'north', location: { latitude: 1.4304, longitude: 103.8354 } },
  { id: 'sentosa', name: 'Sentosa Island', region: 'south', location: { latitude: 1.2494, longitude: 103.8303 } },
  { id: 'punggol', name: 'Punggol', region: 'north', location: { latitude: 1.4052, longitude: 103.9023 } },
  { id: 'sengkang', name: 'Sengkang', region: 'north', location: { latitude: 1.3868, longitude: 103.8914 } },
  { id: 'bukit-batok', name: 'Bukit Batok', region: 'west', location: { latitude: 1.3590, longitude: 103.7505 } },
  { id: 'toa-payoh', name: 'Toa Payoh', region: 'central', location: { latitude: 1.3343, longitude: 103.8499 } },
  { id: 'newton', name: 'Newton / Novena', region: 'central', location: { latitude: 1.3129, longitude: 103.8384 } },
  { id: 'pasir-ris', name: 'Pasir Ris', region: 'east', location: { latitude: 1.3721, longitude: 103.9474 } },
  { id: 'tuas', name: 'Tuas', region: 'west', location: { latitude: 1.3200, longitude: 103.6400 } },
];

/**
 * Finds the closest Singapore region from coordinate
 */
export function getClosestRegion(lat: number, lon: number): RegionKey {
  const regions: RegionKey[] = ['central', 'north', 'south', 'east', 'west'];
  let closest: RegionKey = 'central';
  let minDistance = Infinity;

  for (const r of regions) {
    const d = calculateDistanceKm(
      lat,
      lon,
      SINGAPORE_REGIONS[r].location.latitude,
      SINGAPORE_REGIONS[r].location.longitude
    );
    if (d < minDistance) {
      minDistance = d;
      closest = r;
    }
  }

  return closest;
}

/**
 * Finds the closest station from a list of stations
 */
export function findNearestStation(
  stations: WeatherStation[],
  lat: number,
  lon: number
): { station: WeatherStation; distanceKm: number } | null {
  if (!stations || stations.length === 0) return null;

  let nearest: WeatherStation | null = null;
  let minDistance = Infinity;

  for (const st of stations) {
    if (!st.location?.latitude || !st.location?.longitude) continue;
    const dist = calculateDistanceKm(lat, lon, st.location.latitude, st.location.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...st, distanceKm: dist };
    }
  }

  return nearest ? { station: nearest, distanceKm: minDistance } : null;
}
