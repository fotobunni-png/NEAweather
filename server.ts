import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler, { getHealthStatus } from './api/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Health Check routes (Requirement #2: /api/health.js and /api/health)
app.get(['/api/health', '/api/health.js'], async (req, res) => {
  try {
    await healthHandler(req, res);
  } catch (error) {
    console.error('Error in /api/health:', error);
    res.status(500).json({
      status: 'DOWN',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Proxy route for Singapore Weather Data (optional fallback if client needs proxy)
app.get('/api/weather/all', async (_req, res) => {
  try {
    const [tempRes, rainRes, psiRes] = await Promise.all([
      fetch('https://api-open.data.gov.sg/v2/real-time/api/air-temperature').then(r => r.json()),
      fetch('https://api-open.data.gov.sg/v2/real-time/api/rainfall').then(r => r.json()),
      fetch('https://api-open.data.gov.sg/v2/real-time/api/psi').then(r => r.json()),
    ]);

    res.json({
      temperature: tempRes,
      rainfall: rainRes,
      psi: psiRes,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to fetch NEA real-time data',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SG Weather & PSI Server listening on port ${PORT}`);
  });
}

startServer();
