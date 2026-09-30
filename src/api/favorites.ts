import { Router } from 'express';
import { db } from '../db/index.ts';
import { favorites, pgs } from '../db/schema.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { and, eq } from 'drizzle-orm';

const router = Router();

// GET /api/favorites/my - Get tenant's saved favorites
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userFavs = await db.query.favorites.findMany({
      where: eq(favorites.userId, req.dbUser.id),
      with: {
        pg: {
          with: {
            images: true,
            rooms: true,
          },
        },
      },
    });

    return res.json({ success: true, data: userFavs.map((f) => f.pg) });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch favorites' });
  }
});

// POST /api/favorites/toggle - Toggle save favorite
router.post('/toggle', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pgId } = req.body;
    if (!pgId) {
      return res.status(400).json({ error: 'pgId is required' });
    }

    const numericPgId = parseInt(pgId, 10);

    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, req.dbUser.id), eq(favorites.pgId, numericPgId)));

    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, req.dbUser.id), eq(favorites.pgId, numericPgId)));
      return res.json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await db.insert(favorites).values({
        userId: req.dbUser.id,
        pgId: numericPgId,
      });
      return res.json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ error: error.message || 'Failed to toggle favorite' });
  }
});

// GET /api/favorites/check/:pgId
router.get('/check/:pgId', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.json({ success: true, isFavorite: false });
    }

    const numericPgId = parseInt(req.params.pgId, 10);
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, req.dbUser.id), eq(favorites.pgId, numericPgId)));

    return res.json({ success: true, isFavorite: existing.length > 0 });
  } catch (error: any) {
    return res.json({ success: true, isFavorite: false });
  }
});

export default router;
