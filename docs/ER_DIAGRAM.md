# PGFinder — Entity-Relationship (ER) Diagram & Schema Specification

## 1. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ PGS : "owns"
    USERS ||--o{ BOOKINGS : "requests"
    USERS ||--o{ VISITS : "schedules"
    USERS ||--o{ FAVORITES : "bookmarks"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"

    PGS ||--|{ ROOMS : "contains"
    PGS ||--o{ PG_IMAGES : "has gallery"
    PGS ||--o{ PG_AMENITIES : "features"
    PGS ||--o{ BOOKINGS : "has bookings"
    PGS ||--o{ VISITS : "hosts visits"
    PGS ||--o{ FAVORITES : "is bookmarked in"
    PGS ||--o{ REVIEWS : "reviewed by"

    AMENITIES ||--o{ PG_AMENITIES : "categorized in"
    ROOMS ||--o{ BOOKINGS : "reserved in"

    USERS {
        serial id PK
        text uid UK "Firebase UID"
        text name
        text email
        text phone
        text role "USER | OWNER | ADMIN"
        text avatar
        timestamp created_at
        timestamp updated_at
    }

    PGS {
        serial id PK
        integer owner_id FK
        text name
        text tagline
        text description
        text gender_type "BOYS | GIRLS | COED"
        text city
        text address
        text locality
        double_precision latitude
        double_precision longitude
        integer monthly_rent "Starting rent"
        integer security_deposit
        integer notice_period_days
        integer available_beds
        integer total_beds
        text verification_status "PENDING | VERIFIED | REJECTED"
        text rules "JSON Array"
        boolean food_included
        text food_type
        text gate_closing_time
        real rating
        integer review_count
        timestamp created_at
        timestamp updated_at
    }

    ROOMS {
        serial id PK
        integer pg_id FK
        text room_type "SINGLE | DOUBLE | TRIPLE | FOUR_SHARING"
        integer rent
        integer total_beds
        integer available_beds
        boolean has_attached_bathroom
        boolean has_balcony
        boolean has_ac
        text description
        timestamp created_at
    }

    AMENITIES {
        serial id PK
        text name UK
        text icon
        text category "ESSENTIAL | COMFORT | SAFETY | FACILITY"
    }

    PG_AMENITIES {
        serial id PK
        integer pg_id FK
        integer amenity_id FK
    }

    PG_IMAGES {
        serial id PK
        integer pg_id FK
        text image_url
        text caption
        boolean is_primary
        timestamp created_at
    }

    BOOKINGS {
        serial id PK
        integer user_id FK
        integer pg_id FK
        integer room_id FK
        text status "PENDING | ACCEPTED | REJECTED | CANCELLED | COMPLETED"
        text move_in_date
        text sharing_type
        text message
        text owner_note
        timestamp created_at
        timestamp updated_at
    }

    VISITS {
        serial id PK
        integer user_id FK
        integer pg_id FK
        text visit_date
        text visit_time
        text status "PENDING | CONFIRMED | COMPLETED | CANCELLED"
        text notes
        timestamp created_at
    }

    FAVORITES {
        serial id PK
        integer user_id FK
        integer pg_id FK
        timestamp created_at
    }

    REVIEWS {
        serial id PK
        integer user_id FK
        integer pg_id FK
        integer rating "1 to 5"
        integer cleanliness_rating
        integer food_rating
        text comment
        timestamp created_at
    }

    NOTIFICATIONS {
        serial id PK
        integer user_id FK
        text title
        text message
        text type "BOOKING | VISIT | VERIFICATION | INFO"
        boolean is_read
        text link
        timestamp created_at
    }
```

---

## 2. Table Specifications & Constraints

### 2.1 `users`
- Primary Identifier: `id` (Serial Auto-increment)
- External Key: `uid` (Text, Unique, Not Null) — direct map to Firebase Authentication UID.
- Role Enforcement: `role` text column defaulting to `'USER'`. Allowed values: `'USER'`, `'OWNER'`, `'ADMIN'`.

### 2.2 `pgs`
- Foreign Key: `owner_id` references `users(id)` ON DELETE CASCADE.
- Location Coordinates: `latitude` and `longitude` stored as `double precision` for map clustering, distance calculations, and Google Maps integration.
- Verification Status: `verification_status` with values `'PENDING'`, `'VERIFIED'`, `'REJECTED'`.
- Dynamic Aggregates: `rating` (real) and `review_count` (integer) for high-performance sorting without expensive join-aggregation on every listing query.

### 2.3 `rooms`
- Foreign Key: `pg_id` references `pgs(id)` ON DELETE CASCADE.
- Type categorization: `SINGLE`, `DOUBLE`, `TRIPLE`, `FOUR_SHARING`.
- Real-time inventory tracking: `total_beds` and `available_beds`.

### 2.4 `amenities` & `pg_amenities`
- Normalized many-to-many junction enabling fast filtering by multiple tags (e.g. WiFi, Food, AC, Biometrics, Parking).

### 2.5 `bookings`
- Multi-party lifecycle state machine:
  - `PENDING` -> User submitted request.
  - `ACCEPTED` -> PG owner approved booking.
  - `REJECTED` -> Owner rejected (e.g. no beds left).
  - `CANCELLED` -> User cancelled.
  - `COMPLETED` -> Tenancy commenced.

### 2.6 `visits`
- Physical scheduled tours before booking, linking prospective tenants and PG hosts.
