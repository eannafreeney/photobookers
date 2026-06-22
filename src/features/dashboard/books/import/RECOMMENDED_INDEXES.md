# Recommended Database Indexes for CSV Import Feature

## Overview
These indexes improve performance for the CSV import feature, particularly for creator lookups and duplicate detection.

## Indexes to Add

### 1. Creator Display Name (Case-Insensitive)
**Purpose**: Speeds up creator lookups by display name during import
**Impact**: Critical for batch creator resolution performance

```sql
-- Case-insensitive index for creator display name lookups
CREATE INDEX IF NOT EXISTS idx_creators_display_name_lower 
ON creators (LOWER(display_name));

-- Optional: Composite index with type for even faster lookups
CREATE INDEX IF NOT EXISTS idx_creators_type_display_name_lower 
ON creators (type, LOWER(display_name));
```

### 2. Books by Title and Artist
**Purpose**: Speeds up duplicate detection during import  
**Impact**: Important for checking if book already exists

```sql
-- Index for duplicate detection (title + artist)
CREATE INDEX IF NOT EXISTS idx_books_title_artist_user 
ON books (title, artist_id, created_by_user_id);
```

### 3. Books by User and Creation Date
**Purpose**: Speeds up rate limiting checks
**Impact**: Critical for rate limiting queries

```sql
-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_books_user_created_at 
ON books (created_by_user_id, created_at DESC);

-- Index for image upload rate limiting
CREATE INDEX IF NOT EXISTS idx_books_user_updated_at 
ON books (created_by_user_id, updated_at DESC);
```

### 4. Creator Stub Creation Tracking
**Purpose**: Speeds up rate limiting on stub creator creation
**Impact**: Important for preventing abuse

```sql
-- Index for checking recent stub creation
CREATE INDEX IF NOT EXISTS idx_creators_user_status_created 
ON creators (created_by_user_id, status, created_at DESC) 
WHERE status = 'stub';
```

## Implementation

### Option 1: Drizzle Migration
Create a new migration file using `npm run db:generate` or manually:

```typescript
// drizzle/migrations/XXXX_add_import_indexes.sql
-- Add all the indexes above
```

Then run: `npm run db:migrate`

### Option 2: Direct SQL
Run the SQL commands above directly in your database.

### Option 3: Schema Definition
Add indexes to `src/db/schema.ts` using Drizzle's index definitions:

```typescript
import { index } from 'drizzle-orm/pg-core';

export const creators = pgTable('creators', {
  // ... existing columns
}, (table) => ({
  displayNameLowerIdx: index('idx_creators_display_name_lower')
    .on(sql`LOWER(${table.displayName})`),
  typeDisplayNameIdx: index('idx_creators_type_display_name_lower')
    .on(table.type, sql`LOWER(${table.displayName})`),
}));

export const books = pgTable('books', {
  // ... existing columns  
}, (table) => ({
  titleArtistUserIdx: index('idx_books_title_artist_user')
    .on(table.title, table.artistId, table.createdByUserId),
  userCreatedAtIdx: index('idx_books_user_created_at')
    .on(table.createdByUserId, table.createdAt),
  userUpdatedAtIdx: index('idx_books_user_updated_at')
    .on(table.createdByUserId, table.updatedAt),
}));
```

## Performance Impact

### Before Indexes
- Creator lookup: O(n) full table scan - ~50-100ms per lookup
- Duplicate detection: O(n) table scan - ~100-200ms per check
- Rate limiting: O(n) table scan - ~50-100ms per check

### After Indexes
- Creator lookup: O(log n) index scan - ~1-5ms per lookup
- Duplicate detection: O(log n) index scan - ~1-5ms per check  
- Rate limiting: O(log n) index scan - ~1-5ms per check

### Overall Import Impact
- 100 books with 20 unique artists:
  - Before: 20 lookups × 50ms = 1,000ms wasted on lookups
  - After: 20 lookups × 2ms = 40ms on lookups
  - **Improvement: ~960ms faster (25× speedup on lookups)**

## Verification

After adding indexes, verify they're being used:

```sql
-- Check if index exists
SELECT * FROM pg_indexes WHERE tablename = 'creators';
SELECT * FROM pg_indexes WHERE tablename = 'books';

-- Explain query to verify index usage
EXPLAIN ANALYZE 
SELECT * FROM creators 
WHERE LOWER(display_name) = LOWER('John Doe');
```

Look for "Index Scan" in the output (not "Seq Scan").

## Maintenance

These indexes are automatically maintained by PostgreSQL. No manual maintenance required.

Monitor index usage:
```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename IN ('books', 'creators')
ORDER BY idx_scan DESC;
```

If `idx_scan` is high, the index is being used effectively.
