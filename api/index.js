import express from 'express';
import healthHandler from './health.js';
import temperatureHandler from './temperature.js';
import rainfallHandler from './rainfall.js';
import psiHandler from './psi.js';
import weatherHandler from './weather.js';

const router = express.Router();

// Health Monitoring endpoints (Requirement #2)
router.get(['/health', '/health.js'], (req, res) => healthHandler(req, res));

// Real-Time Temperature API
router.get(['/temperature', '/temperature.js', '/air-temperature'], (req, res) =>
  temperatureHandler(req, res)
);

// Real-Time Rainfall API
router.get(['/rainfall', '/rainfall.js'], (req, res) =>
  rainfallHandler(req, res)
);

// Real-Time PSI API
router.get(['/psi', '/psi.js'], (req, res) =>
  psiHandler(req, res)
);

// Consolidated Weather API
router.get(['/weather', '/weather.js', '/weather/all'], (req, res) =>
  weatherHandler(req, res)
);

export default router;
