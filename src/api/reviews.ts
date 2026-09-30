import { Router } from 'express';
import { db } from '../db/index.ts';
import { reviews, pgs, users } from '../db/schema.ts';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { eq, desc, avg, count } from 'drizzle-orm';

const router = Router();

// GET /api/reviews/pg/:pgId - Fetch all reviews for a PG
router.get('/pg/:pgId', optionalAuth, async (req, res) => {
  try {
    const pgId = parseInt(req.params.pgId, 10);
    if (isNaN(pgId)) {
      return res.status(400).json({ error: 'Invalid PG ID' });
    }

    const reviewList = await db.query.reviews.findMany({
      where: eq(reviews.pgId, pgId),
      orderBy: [desc(reviews.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.json({ success: true, count: reviewList.length, data: reviewList });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch reviews' });
  }
});

// POST /api/reviews - Submit a new review & update PG aggregate rating
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pgId, rating, comment } = req.body;
    if (!pgId || !rating || !comment) {
      return res.status(400).json({ error: 'pgId, rating, and comment are required' });
    }

    const numericPgId = parseInt(pgId, 10);
    const numericRating = Math.max(1, Math.min(5, parseFloat(rating)));

    // Insert new review
    const [newReview] = await db
      .insert(reviews)
      .values({
        pgId: numericPgId,
        userId: req.dbUser.id,
        rating: numericRating,
        comment: comment.trim(),
      })
      .returning();

    // Recalculate average rating & review count for the PG
    const allReviews = await db
      .select({
        rating: reviews.rating,
      })
      .from(reviews)
      .where(eq(reviews.pgId, numericPgId));

    const totalCount = allReviews.length;
    const avgRating =
      totalCount > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
        : 5.0;

    await db
      .update(pgs)
      .set({
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: totalCount,
      })
      .where(eq(pgs.id, numericPgId));

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: newReview,
      updatedRating: avgRating,
      reviewCount: totalCount,
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit review' });
  }
});

export default router;
