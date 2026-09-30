import { Router } from 'express';
import { db } from '../db/index.ts';
import { bookings, pgs, rooms, users } from '../db/schema.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// POST /api/bookings - Create booking request
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const { pgId, roomId, moveInDate, sharingType, message } = req.body;
    if (!pgId) {
      return res.status(400).json({ error: 'pgId is required' });
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: req.dbUser.id,
        pgId: parseInt(pgId, 10),
        roomId: roomId ? parseInt(roomId, 10) : null,
        moveInDate: moveInDate || new Date().toISOString().split('T')[0],
        sharingType: sharingType || 'Double Sharing',
        message: message || '',
        status: 'PENDING',
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: 'Booking request sent to PG owner',
      data: newBooking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit booking' });
  }
});

// GET /api/bookings/my - User's bookings
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const userBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, req.dbUser.id),
      orderBy: [desc(bookings.createdAt)],
      with: {
        pg: {
          with: {
            images: true,
          },
        },
        room: true,
      },
    });

    return res.json({ success: true, data: userBookings });
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/owner - Owner's bookings across all their PGs
router.get('/owner', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    // Get owner's PGs
    const ownerPgs = await db.select({ id: pgs.id }).from(pgs).where(eq(pgs.ownerId, req.dbUser.id));
    const ownerPgIds = ownerPgs.map((p) => p.id);

    if (ownerPgIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const allBookings = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        pg: true,
        room: true,
      },
    });

    const filtered = allBookings.filter((b) => ownerPgIds.includes(b.pgId));
    return res.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error('Error fetching owner bookings:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch owner bookings' });
  }
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, ownerNote } = req.body;

    if (!['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const [updated] = await db
      .update(bookings)
      .set({
        status,
        ownerNote: ownerNote ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ error: error.message || 'Failed to update booking status' });
  }
});

export default router;
