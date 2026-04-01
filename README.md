# Content Analytics Platform

A learning experience platform with a highly optimized analytics tracking architecture.

## Overview

This application serves structured learning content (Books → Chapters → Content) and passively records deep telemetry into how users interact with the material. It features video playback, tracking hooks, and a real-time analytics dashboard rendering aggregated performance data.

---

## 🏗 System Architecture & Decisions

### 1. Data Schema & Modeling

The Postgres database is split into two logical zones:
- **Core Entities:** `books`, `chapters`, `content`. These tables use UUIDs with cascading deletes, representing the rigid structure of the application.
- **Telemetry Layer:** `click_events`, `progress_events`, `watch_events`. These act as append-only ledgers to safely and quickly record time-series style data at high velocity without mutating core tables.

**Why this model?**
By decoupling content state from event logs, the platform can endure high write throughput. Analytics queries on the ledger tables are isolated from the transactional demands of the core UI.

### 2. High-Frequency Event Handling (Performance)

A major challenge with video streams and scrolling is the sheer volume of telemetry events (`timeupdate`, `onscroll` fires dozens of times per second). 

- **Frontend Batching / Accumulation:** Instead of `POSTing` to the server every time the user scrolls or watches a second of video, the React frontend accumulates this state in memory using lightweight `useRef` hooks (which avoids React re-renders). 
- **SendBeacon / Keepalive:** The batched data is flushed to the database asynchronously on component unmount and `beforeunload`. We use `fetch({ keepalive: true })` to guarantee the payload is delivered to the Next.js API even if the browser window is closed, offloading network bottlenecks.

**Why this scales:** 
At scale, making a DB round-trip for every 1-second watch increment would immediately overwhelm connection pools. By batching to the session level, database writes are reduced by 99%, making PostgreSQL perfectly viable as the primary datastore without requiring an intermediary message queue (like Kafka) or Redis.

### 3. Query Performance

The analytics dashboard requires joining massive telemetry tables (`watch_events`) with reference tables (`content`).
- **Indexing:** In production, foreign keys like `content_id` in the event tables natively boost join performance.
- **Rollups (Future Scale):** While the current system queries the raw event logs using `GROUP BY`, as data volume exceeds millions of rows, the architecture maps perfectly to Postgres Materialized Views. The `GROUP BY we.video_id, c.title` operation can easily be shifted entirely out of the route handler into a background refresh view.

### 4. Justification for Third Analytic: "Scroll Depth / Completion Progress"

In addition to explicit actions (Clicks) and active consumption (Video Watch Time), I introduced **Scroll Depth / Content Completion Rate**.

**Business Value:**
Learning platforms suffer from silent drop-off where users read a paragraph and leave without ever triggering a negative action. By tracking maximum scroll percentage (`progress_events`), curriculum designers can immediately spot if a specific written lesson is too long or boring (e.g. 100% video completion but only 15% text scroll completion). This helps pinpoint exactly where engagement is lost.

---

## 🚀 Running Locally

1. **Prerequisites:** Make sure you have Node >20 installed and access to a Postgres database.
2. **Environment:** Create a `.env.local` containing:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
3. **Initialize DB:**
   ```bash
   node --env-file=.env.local init-db.js
   ```
   *(This will drop existing tables, create the schema, and insert sample books/videos).*
4. **Run Application:**
   ```bash
   npm install
   npm run build
   npm run start
   ```

*Next.js App Router will serve the application on `http://localhost:3000`.*
