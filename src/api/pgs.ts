import { Router } from 'express';
import { db } from '../db/index.ts';
import { pgs, rooms, pgImages, pgAmenities, amenities, users, reviews } from '../db/schema.ts';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { and, eq, gte, ilike, lte, or, sql, desc, asc } from 'drizzle-orm';

const router = Router();

// GET /api/pgs - Discovery with filters and sorting
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      city,
      locality,
      genderType,
      minRent,
      maxRent,
      roomType,
      foodIncluded,
      verifiedOnly,
      amenities: requestedAmenities,
      search,
      sortBy = 'rating',
      sortOrder = 'desc',
    } = req.query;

    const conditions = [];

    if (city && typeof city === 'string' && city !== 'All') {
      conditions.push(ilike(pgs.city, `%${city}%`));
    }
    if (locality && typeof locality === 'string') {
      conditions.push(ilike(pgs.locality, `%${locality}%`));
    }
    if (genderType && typeof genderType === 'string' && genderType !== 'ALL') {
      conditions.push(eq(pgs.genderType, genderType));
    }
    if (minRent) {
      conditions.push(gte(pgs.monthlyRent, parseInt(minRent as string, 10)));
    }
    if (maxRent) {
      conditions.push(lte(pgs.monthlyRent, parseInt(maxRent as string, 10)));
    }
    if (foodIncluded === 'true') {
      conditions.push(eq(pgs.foodIncluded, true));
    } else if (foodIncluded === 'false') {
      conditions.push(eq(pgs.foodIncluded, false));
    }
    if (verifiedOnly === 'true') {
      conditions.push(eq(pgs.verificationStatus, 'VERIFIED'));
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      conditions.push(
        or(
          ilike(pgs.name, `%${q}%`),
          ilike(pgs.city, `%${q}%`),
          ilike(pgs.locality, `%${q}%`),
          ilike(pgs.address, `%${q}%`),
          ilike(pgs.description, `%${q}%`),
          ilike(pgs.tagline, `%${q}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderExpr;
    if (sortBy === 'price_asc' || (sortBy === 'rent' && sortOrder === 'asc')) {
      orderExpr = asc(pgs.monthlyRent);
    } else if (sortBy === 'price_desc' || (sortBy === 'rent' && sortOrder === 'desc')) {
      orderExpr = desc(pgs.monthlyRent);
    } else if (sortBy === 'newest') {
      orderExpr = desc(pgs.createdAt);
    } else {
      orderExpr = desc(pgs.rating);
    }

    const pgList = await db.query.pgs.findMany({
      where: whereClause,
      orderBy: [orderExpr],
      with: {
        images: true,
        rooms: true,
        amenities: {
          with: {
            amenity: true,
          },
        },
        owner: {
          columns: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    let filtered = pgList;

    // Room sharing filter
    if (roomType && typeof roomType === 'string' && roomType !== 'ALL') {
      filtered = filtered.filter((p) =>
        p.rooms.some((r) => r.roomType.toLowerCase() === roomType.toLowerCase())
      );
    }

    // Amenities filter
    if (requestedAmenities && typeof requestedAmenities === 'string') {
      const amenityNames = requestedAmenities.split(',').map((s) => s.trim().toLowerCase());
      if (amenityNames.length > 0) {
        filtered = filtered.filter((p) =>
          amenityNames.every((reqName) =>
            p.amenities.some((a) =>
              a.amenity.name.toLowerCase().includes(reqName)
            )
          )
        );
      }
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching PGs:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch PG listings' });
  }
});

// GET /api/pgs/:id - Detailed PG
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid PG ID' });
    }

    const pg = await db.query.pgs.findFirst({
      where: eq(pgs.id, id),
      with: {
        images: true,
        rooms: true,
        amenities: {
          with: {
            amenity: true,
          },
        },
        reviews: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: [desc(reviews.createdAt)],
        },
        owner: {
          columns: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!pg) {
      return res.status(404).json({ error: 'PG not found' });
    }

    return res.json({ success: true, data: pg });
  } catch (error: any) {
    console.error('Error fetching PG detail:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch PG detail' });
  }
});

// POST /api/pgs - Owner creates PG listing
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const {
      name,
      tagline,
      description,
      genderType,
      city,
      address,
      locality,
      latitude,
      longitude,
      monthlyRent,
      securityDeposit,
      noticePeriodDays,
      foodIncluded,
      foodType,
      gateClosingTime,
      rules,
      roomsData,
      imageUrls,
      amenityIds,
    } = req.body;

    if (!name || !genderType || !city || !address || !monthlyRent) {
      return res.status(400).json({ error: 'Missing required PG fields' });
    }

    // Insert PG property
    const [newPg] = await db
      .insert(pgs)
      .values({
        ownerId: req.dbUser.id,
        name,
        tagline: tagline || '',
        description: description || '',
        genderType,
        city,
        address,
        locality: locality || city,
        latitude: latitude ? parseFloat(latitude) : 17.4485,
        longitude: longitude ? parseFloat(longitude) : 78.3908,
        monthlyRent: parseInt(monthlyRent, 10),
        securityDeposit: securityDeposit ? parseInt(securityDeposit, 10) : 0,
        noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays, 10) : 30,
        foodIncluded: foodIncluded ?? true,
        foodType: foodType || 'Veg & Non-Veg',
        gateClosingTime: gateClosingTime || '10:30 PM',
        rules: rules ? (typeof rules === 'string' ? rules : JSON.stringify(rules)) : '[]',
        verificationStatus: 'PENDING',
        rating: 5.0,
        reviewCount: 0,
      })
      .returning();

    // Insert rooms if provided
    if (Array.isArray(roomsData) && roomsData.length > 0) {
      for (const room of roomsData) {
        await db.insert(rooms).values({
          pgId: newPg.id,
          roomType: room.roomType,
          rent: parseInt(room.rent, 10),
          totalBeds: parseInt(room.totalBeds, 10) || 1,
          availableBeds: parseInt(room.availableBeds, 10) || 1,
          hasAttachedBathroom: room.hasAttachedBathroom ?? true,
          hasBalcony: room.hasBalcony ?? false,
          hasAc: room.hasAc ?? false,
          description: room.description || '',
        });
      }
    }

    // Insert images
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        await db.insert(pgImages).values({
          pgId: newPg.id,
          imageUrl: imageUrls[i],
          caption: i === 0 ? 'Main View' : `View ${i + 1}`,
          isPrimary: i === 0,
        });
      }
    }

    // Link amenities
    if (Array.isArray(amenityIds) && amenityIds.length > 0) {
      for (const amenityId of amenityIds) {
        await db.insert(pgAmenities).values({
          pgId: newPg.id,
          amenityId: parseInt(amenityId, 10),
        });
      }
    }

    // Update user role to OWNER if currently USER
    if (req.dbUser.role === 'USER') {
      await db.update(users).set({ role: 'OWNER' }).where(eq(users.id, req.dbUser.id));
    }

    return res.status(201).json({
      success: true,
      message: 'PG successfully registered and submitted for verification!',
      data: newPg,
    });
  } catch (error: any) {
    console.error('Error creating PG:', error);
    return res.status(500).json({ error: error.message || 'Failed to create PG listing' });
  }
});

// GET /api/pgs/:id/rooms
router.get('/:id/rooms', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const roomList = await db.select().from(rooms).where(eq(rooms.pgId, id));
    return res.json({ success: true, data: roomList });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch rooms' });
  }
});

export default router;
