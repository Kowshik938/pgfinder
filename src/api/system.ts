import { Router } from 'express';
import { db } from '../db/index.ts';
import { amenities, pgs, rooms, users, bookings, reviews, visits } from '../db/schema.ts';
import { count, sql } from 'drizzle-orm';

const router = Router();

// GET /api/system/health - Live Cloud SQL & system verification
router.get('/health', async (_req, res) => {
  try {
    const [userCount] = await db.select({ value: count() }).from(users);
    const [pgCount] = await db.select({ value: count() }).from(pgs);
    const [roomCount] = await db.select({ value: count() }).from(rooms);
    const [amenityCount] = await db.select({ value: count() }).from(amenities);
    const [bookingCount] = await db.select({ value: count() }).from(bookings);

    return res.json({
      status: 'healthy',
      database: 'PostgreSQL (Cloud SQL)',
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount.value,
        pgs: pgCount.value,
        rooms: roomCount.value,
        amenities: amenityCount.value,
        bookings: bookingCount.value,
      },
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message || 'Database connection error',
    });
  }
});

// GET /api/system/amenities - Master amenities list
router.get('/amenities', async (_req, res) => {
  try {
    const list = await db.select().from(amenities);
    return res.json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch amenities' });
  }
});

// GET /api/system/stats - Aggregated stats for hero and platform
router.get('/stats', async (_req, res) => {
  try {
    const [pgCount] = await db.select({ value: count() }).from(pgs);
    const [roomCount] = await db.select({ value: count() }).from(rooms);
    const [bookingCount] = await db.select({ value: count() }).from(bookings);
    const [reviewCount] = await db.select({ value: count() }).from(reviews);

    return res.json({
      success: true,
      stats: {
        totalPgs: pgCount.value,
        totalRooms: roomCount.value,
        totalBookings: bookingCount.value,
        totalReviews: reviewCount.value,
        citiesCovered: ['Hyderabad', 'Bangalore', 'Pune', 'Delhi NCR', 'Chennai'],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
});

export default router;
