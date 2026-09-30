import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Users Table
 * Links directly with Firebase Auth UID
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal unique identifier
  name: text('name').notNull().default('Guest User'),
  email: text('email').notNull(),
  phone: text('phone'),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('USER'), // 'USER' | 'OWNER' | 'ADMIN'
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * PGs (Paying Guest Accommodations) Table
 */
export const pgs = pgTable('pgs', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  tagline: text('tagline'),
  description: text('description'),
  genderType: text('gender_type').notNull(), // 'BOYS' | 'GIRLS' | 'COED'
  city: text('city').notNull(),
  address: text('address').notNull(),
  locality: text('locality'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  monthlyRent: integer('monthly_rent').notNull(), // Starting price
  securityDeposit: integer('security_deposit').default(0),
  noticePeriodDays: integer('notice_period_days').default(30),
  availableBeds: integer('available_beds').default(0),
  totalBeds: integer('total_beds').default(0),
  verificationStatus: text('verification_status').notNull().default('PENDING'), // 'PENDING' | 'VERIFIED' | 'REJECTED'
  rules: text('rules'), // JSON string array of rules
  foodIncluded: boolean('food_included').default(true),
  foodType: text('food_type').default('Veg & Non-Veg'), // 'Veg only' | 'Veg & Non-Veg'
  gateClosingTime: text('gate_closing_time').default('10:30 PM'),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Rooms Table
 */
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  roomType: text('room_type').notNull(), // 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING'
  rent: integer('rent').notNull(),
  totalBeds: integer('total_beds').notNull().default(1),
  availableBeds: integer('available_beds').notNull().default(1),
  hasAttachedBathroom: boolean('has_attached_bathroom').default(true),
  hasBalcony: boolean('has_balcony').default(false),
  hasAc: boolean('has_ac').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Amenities Master Table
 */
export const amenities = pgTable('amenities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  category: text('category').default('ESSENTIAL'), // 'ESSENTIAL' | 'COMFORT' | 'SAFETY' | 'FACILITY'
});

/**
 * PG Amenities Join Table (Many-to-Many)
 */
export const pgAmenities = pgTable('pg_amenities', {
  id: serial('id').primaryKey(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  amenityId: integer('amenity_id').references(() => amenities.id, { onDelete: 'cascade' }).notNull(),
});

/**
 * PG Images Gallery Table
 */
export const pgImages = pgTable('pg_images', {
  id: serial('id').primaryKey(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Bookings Table
 */
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  moveInDate: text('move_in_date'),
  sharingType: text('sharing_type'),
  message: text('message'),
  ownerNote: text('owner_note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Scheduled Visit Requests Table
 */
export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  visitDate: text('visit_date').notNull(),
  visitTime: text('visit_time').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Favorites / Wishlist Table
 */
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Reviews & Ratings Table
 */
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  pgId: integer('pg_id').references(() => pgs.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  cleanlinessRating: integer('cleanliness_rating').default(5),
  foodRating: integer('food_rating').default(5),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Notifications Table
 */
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('INFO'), // 'BOOKING' | 'VISIT' | 'VERIFICATION' | 'INFO'
  isRead: boolean('is_read').default(false),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  pgs: many(pgs),
  bookings: many(bookings),
  visits: many(visits),
  favorites: many(favorites),
  reviews: many(reviews),
  notifications: many(notifications),
}));

export const pgsRelations = relations(pgs, ({ one, many }) => ({
  owner: one(users, {
    fields: [pgs.ownerId],
    references: [users.id],
  }),
  rooms: many(rooms),
  images: many(pgImages),
  amenities: many(pgAmenities),
  bookings: many(bookings),
  visits: many(visits),
  favorites: many(favorites),
  reviews: many(reviews),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  pg: one(pgs, {
    fields: [rooms.pgId],
    references: [pgs.id],
  }),
  bookings: many(bookings),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  pgs: many(pgAmenities),
}));

export const pgAmenitiesRelations = relations(pgAmenities, ({ one }) => ({
  pg: one(pgs, {
    fields: [pgAmenities.pgId],
    references: [pgs.id],
  }),
  amenity: one(amenities, {
    fields: [pgAmenities.amenityId],
    references: [amenities.id],
  }),
}));

export const pgImagesRelations = relations(pgImages, ({ one }) => ({
  pg: one(pgs, {
    fields: [pgImages.pgId],
    references: [pgs.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  pg: one(pgs, {
    fields: [bookings.pgId],
    references: [pgs.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  user: one(users, {
    fields: [visits.userId],
    references: [users.id],
  }),
  pg: one(pgs, {
    fields: [visits.pgId],
    references: [pgs.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  pg: one(pgs, {
    fields: [favorites.pgId],
    references: [pgs.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  pg: one(pgs, {
    fields: [reviews.pgId],
    references: [pgs.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
