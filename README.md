# Localize

Next.js app where signed-in users create shareable location links by topic (restaurants, malls, auto dealers).
When clients open a link and share location, the app:
1. Captures their coordinates from the browser.
2. Logs the location usage in Neon Postgres tied to the link.

## Stack
- Next.js 14 (App Router, TypeScript)
- NextAuth (Google OAuth)
- Neon Postgres via `@neondatabase/serverless`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file and fill values:
   ```bash
   cp .env.example .env.local
   ```
3. Create database schema (run in Neon SQL editor):
   ```sql
   CREATE TABLE IF NOT EXISTS share_links (
     id BIGSERIAL PRIMARY KEY,
     slug TEXT NOT NULL UNIQUE,
     topic TEXT NOT NULL,
     owner_email TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE TABLE IF NOT EXISTS location_events (
     id BIGSERIAL PRIMARY KEY,
     link_id BIGINT NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
     latitude DOUBLE PRECISION NOT NULL,
     longitude DOUBLE PRECISION NOT NULL,
     accuracy_meters DOUBLE PRECISION,
     client_ip TEXT,
     user_agent TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE INDEX IF NOT EXISTS idx_location_events_link_id ON location_events(link_id);
   ```
4. Start app:
   ```bash
   npm run dev
   ```

## Routes
- `/` homepage with product explanation and Google login
- `/dashboard` authenticated link management
- `/dashboard/links/[slug]` dashboard analytics page with all captured locations for that link
- `/go/[slug]` client page to share location

## Notes
- Google Maps API key is not required in the current version.
- The current flow stores locations only. Nearby-place lookup can be added later.
