# PGFinder — System Architecture Specification (Phase 1)

## 1. System Overview

**PGFinder** is a production-grade, full-stack Paying Guest (PG) discovery and booking platform built with modern web technologies, backed by a persistent **PostgreSQL (Cloud SQL)** database, secured by **Firebase Authentication / JWT**, and styled with an indigo/violet modern design system.

```
                      +------------------------------------------+
                      |         Client Browser (React 19)        |
                      |  - Vite SPA + Tailwind CSS + Motion     |
                      |  - Role Selector (User, Owner, Admin)   |
                      |  - Interactive Map & Discovery Cards    |
                      +--------------------+---------------------+
                                           |
                                  HTTPS REST APIs (Bearer JWT)
                                           |
                                           v
                      +------------------------------------------+
                      |            Backend API Server            |
                      |  - Express / TypeScript Engine (Port 3000)|
                      |  - Firebase Admin Token Verification     |
                      |  - Drizzle ORM Type-Safe Query Layer     |
                      +--------------------+---------------------+
                                           |
                              Unix Socket / Connection Pool
                                           |
                                           v
                      +------------------------------------------+
                      |       PostgreSQL Relational DB           |
                      |  - Cloud SQL (asia-southeast1)          |
                      |  - 11 Normalized Tables + Foreign Keys  |
                      |  - Drizzle Kit Migrations & Verification |
                      +------------------------------------------+
```

---

## 2. Directory & Folder Structure

```
├── .env.example                     # Environment templates (no secrets)
├── firebase-applet-config.json      # Firebase Client/Admin credentials
├── index.html                       # Entry HTML with custom typography
├── metadata.json                    # AI Studio metadata
├── package.json                     # Dependency manifests & tsx scripts
├── server.ts                        # Unified Express API & Vite Dev server
├── docs/
│   ├── ARCHITECTURE.md              # Technical specifications & roadmap
│   └── ER_DIAGRAM.md                # Entity-Relationship diagram & schema docs
├── src/
│   ├── api/                         # Backend REST controllers
│   │   ├── auth.ts                  # /api/auth (me, role, profile)
│   │   ├── pgs.ts                   # /api/pgs (search, filters, CRUD)
│   │   ├── bookings.ts              # /api/bookings (requests, status updates)
│   │   ├── favorites.ts             # /api/favorites (user bookmarks)
│   │   ├── reviews.ts               # /api/reviews (ratings & feedback)
│   │   ├── visits.ts                # /api/visits (scheduled property tours)
│   │   └── system.ts                # /api/system (health, stats, amenities)
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx          # Real user & role management
│   │   └── FilterContext.tsx        # Search, location, budget, room filter state
│   ├── components/                  # UI components
│   │   ├── Navbar.tsx               # Header with role badge & navigation
│   │   ├── Phase1Hero.tsx           # Interactive Phase 1 overview & search bar
│   │   ├── ArchitectureViewer.tsx   # Interactive ER diagram & API tester
│   │   ├── PGCard.tsx               # Property preview card with tags & price
│   │   ├── DatabaseStatusCard.tsx   # Live Cloud SQL metrics card
│   │   └── AuthModal.tsx            # Login, registration, role switcher
│   ├── db/                          # Database layer
│   │   ├── schema.ts                # Drizzle schema (11 normalized tables)
│   │   ├── index.ts                 # PostgreSQL connection pool (Object Method)
│   │   └── drizzle.config.ts        # Drizzle Kit admin configuration
│   ├── lib/                         # External integrations
│   │   ├── firebase.ts              # Client Firebase App & Auth
│   │   └── firebase-admin.ts        # Backend Firebase Admin SDK
│   ├── middleware/                  # Backend middlewares
│   │   └── auth.ts                  # Token validation & DB user auto-sync
│   ├── App.tsx                      # Root React container
│   ├── index.css                    # Tailwind CSS 4 directives & custom themes
│   └── main.tsx                     # React client bootstrap
```

---

## 3. Database Architecture (PostgreSQL)

- **Engine**: PostgreSQL 15+ on Google Cloud SQL
- **ORM**: Drizzle ORM (`drizzle-orm`) with zero runtime overhead
- **Schema Management**: Drizzle Kit (`drizzle-kit`) with admin credentials
- **Connection Model**: Pooled client connection (`pg.Pool`) configured with lazy execution and global hot-reload cache.
- **Normalization Level**: 3NF (Third Normal Form) with dedicated tables for rooms, images, amenities, and user relations.

---

## 4. REST API Endpoints Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/system/health` | Public | Live database health and row statistics |
| `GET` | `/api/system/stats` | Public | Aggregated platform stats (PGs, rooms, reviews) |
| `GET` | `/api/system/amenities`| Public | Master amenities catalog with icons |
| `GET` | `/api/auth/me` | Authenticated | Current user profile and permissions |
| `POST`| `/api/auth/role` | Authenticated | Switch active role (`USER` <-> `OWNER`) |
| `GET` | `/api/pgs` | Public | Search PGs by city, price range, gender, room type |
| `GET` | `/api/pgs/:id` | Public | Detailed PG view with rooms, photos, amenities, reviews |
| `POST`| `/api/pgs` | Owner/Admin | Register new PG listing with rooms, photos & rules |
| `GET` | `/api/bookings/my` | Authenticated | Current user's booking requests |
| `GET` | `/api/bookings/owner`| Owner | PG owner's incoming booking requests |
| `POST`| `/api/bookings` | Authenticated | Request a bed/room booking |
| `PUT` | `/api/bookings/:id/status`| Owner | Accept, reject, or complete a booking |
| `GET` | `/api/favorites` | Authenticated | List bookmarked PGs |
| `POST`| `/api/favorites` | Authenticated | Add PG to favorites |
| `DELETE`| `/api/favorites/:pgId`| Authenticated | Remove PG from favorites |
| `GET` | `/api/reviews/pg/:id`| Public | List verified reviews for a property |
| `POST`| `/api/reviews/pg/:id`| Authenticated | Submit rating & review for a PG |
| `POST`| `/api/visits` | Authenticated | Schedule an in-person site visit |

---

## 5. Multi-Phase Roadmap Status

- **Phase 1 [COMPLETED]**: Architecture, Folder Structure, PostgreSQL Schema, ER Diagram, Backend foundation, React/Vite foundation, Environment configuration.
- **Phase 2 [COMPLETED]**: Authentication and role system (User / PG Owner / Admin registration, password hashing with bcrypt, JWT authorization, multi-role workspaces, distinct role colors).
- **Phase 3 [COMPLETED]**: Owner PG registration wizard (multi-step form with photos, pricing, amenities, room inventories) + Google Maps Platform (Places search, AdvancedMarker, interactive pin, split map view).
- **Phase 4 [COMPLETED]**: User PG discovery and search (multi-attribute filters, instant search, budget slider, room sharing, food filter, amenities drawer, active filter chips, 3-property side-by-side comparison modal).
- **Phase 5 [COMPLETED]**: Google Maps/Places integration (nearby transit, tech parks, hospitals, supermarkets, walkability score).
- **Phase 6 [COMPLETED]**: Bookings, favorites, visits, and reviews (Transactional BookingModal, ReviewListModal with star ratings, favorites wishlisting).
- **Phase 7 [COMPLETED]**: Owner analytics dashboard (occupancy rate progress bar, revenue run-rate, tenant request workflow).
- **Phase 8 [COMPLETED]**: 3D interactive spatial accommodation experience (Accommodation3DViewer with day/night lighting, orbit rotation, and room styling).
- **Phase 9 [COMPLETED]**: AI Smart Features (AIRoommateMatcherModal and grounded AIAssistantWidget with Gemini 3.8 Flash model).
- **Phase 10 [COMPLETED]**: End-to-end integration, compilation, and production verification.
