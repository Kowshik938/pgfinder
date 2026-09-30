import { Router } from 'express';
import { db } from '../db/index.ts';
import { visits, pgs } from '../db/schema.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// POST /api/visits - Schedule a visit
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pgId, visitDate, visitTime, notes } = req.body;
    if (!pgId || !visitDate || !visitTime) {
      return res.status(400).json({ error: 'pgId, visitDate, and visitTime are required' });
    }

    const [newVisit] = await db
      .insert(visits)
      .values({
        userId: req.dbUser.id,
        pgId: parseInt(pgId, 10),
        visitDate,
        visitTime,
        notes: notes || '',
        status: 'PENDING',
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully! The PG owner has been notified.',
      data: newVisit,
    });
  } catch (error: any) {
    console.error('Error scheduling visit:', error);
    return res.status(500).json({ error: error.message || 'Failed to schedule visit' });
  }
});

// GET /api/visits/my
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const myVisits = await db.query.visits.findMany({
      where: eq(visits.userId, req.dbUser.id),
      orderBy: [desc(visits.createdAt)],
      with: {
        pg: {
          with: {
            images: true,
          },
        },
      },
    });

    return res.json({ success: true, data: myVisits });
  } catch (error: any) {
    console.error('Error fetching visits:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch visits' });
  }
});

export default router;
