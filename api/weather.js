/**
 * Consolidated API handler for Singapore Weather & PSI
 * Returns air temperature, rainfall, and PSI in a single response
 */

import { getTemperatureData } from './temperature.js';
import { getRainfallData } from './rainfall.js';
import { getPsiData } from './psi.js';

export default async function handler(req, res) {
  const force = req?.query?.refresh === 'true';

  try {
    const [temp, rain, psi] = await Promise.all([
      getTemperatureData(force).catch(err => ({ error: err.message, failed: true })),
      getRainfallData(force).catch(err => ({ error: err.message, failed: true })),
      getPsiData(force).catch(err => ({ error: err.message, failed: true })),
    ]);

    const result = {
      timestamp: new Date().toISOString(),
      temperature: temp,
      rainfall: rain,
      psi: psi,
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(result);
    }
    return result;
  } catch (err) {
    if (res && typeof res.status === 'function') {
      return res.status(500).json({
        error: 'Failed to aggregate weather data',
        message: err instanceof Error ? err.message : String(err),
      });
    }
    throw err;
  }
}
