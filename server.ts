import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './src/api/auth.ts';
import pgRoutes from './src/api/pgs.ts';
import bookingRoutes from './src/api/bookings.ts';
import favoriteRoutes from './src/api/favorites.ts';
import reviewRoutes from './src/api/reviews.ts';
import visitRoutes from './src/api/visits.ts';
import systemRoutes from './src/api/system.ts';
import aiRoutes from './src/api/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ai', aiRoutes);

// Vite middleware in development vs static serving in production
async function startServer() {
  if (!isProd) {
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

  app.listen(port, '0.0.0.0', () => {
    console.log(`[PGFinder Server] Running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[PGFinder Server Error]:', err);
  process.exit(1);
});
