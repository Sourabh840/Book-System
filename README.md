# Content Analytics Platform

A learning experience platform with a highly optimized analytics tracking architecture.

## Overview

This application serves structured learning content (Books → Chapters → Content) and passively records deep telemetry into how users interact with the material. It features video playback, tracking hooks, and a real-time analytics dashboard rendering aggregated performance data.

**Live Application:** [https://book-system-1-f3im.onrender.com/](https://book-system-1-f3im.onrender.com/)  
**Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/1J9N12zGKO31g_ivUoEQRUpIwI0eDOFfR/view?usp=sharing)

---

## 🏗 System Architecture & Reasoning

The application employs a modern decoupled architecture using **Next.js (App Router)** as the full-stack framework for React server/client components and API routes. The backend relies on a **PostgreSQL** relational database for stringent data integrity, with stateless **JWT tokens** stored in `HttpOnly` cookies for secure authentication. 

**Architectural Reasoning:**
By combining Next.js with PostgreSQL, we achieve a serverless-friendly frontend with a highly normalized, robust backend. The stateless JWT setup allows horizontal scaling of the Node.js processes without requiring sticky sessions or a centralized session store (like Redis). The telemetry ingest pipeline is decoupled from the main content-serving pipeline, ensuring analytics gathering does not degrade the core user learning experience.

---

## 💾 Database Schema & Explanation

The PostgreSQL database is organized into two primary domains: **Core Entities** (structural content) and **Telemetry Domain** (user high-frequency events).

### Core Entities (Read-Heavy)
- **`books`**: `id (UUID)`, `title`, `description`, `created_at`
  The highest level of content grouping. Uses UUIDs for universally unique identification without exposing chronological creation order.
- **`chapters`**: `id (UUID)`, `book_id (FK)`, `title`, `order_index`, `created_at`
  Organizes content logically and maintains sequential flow with `order_index`. Cascading deletes on `book_id`.
- **`content`**: `id (UUID)`, `chapter_id (FK)`, `title`, `body_text`, `video_url`, `order_index`
  The atomic unit of learning material containing instructional text and video references.
- **`users`**: `id (SERIAL)`, `username (UNIQUE)`, `password_hash`, `created_at`
  Handles authentication. Uses `SERIAL` for efficiency on high-velocity relational queries from the telemetry tables. Passwords are cryptographically hashed via `bcrypt`.

### Telemetry / Analytics Domain (Write-Heavy)
These tables act as append-only ledgers to handle high-velocity time-series data without mutating rows.
- **`click_events`**: `id (SERIAL)`, `user_id (VARCHAR)`, `button_label`, `content_id (FK)`
  Logs discrete user interactions (e.g., "Take Quiz", "Download Notes") to track feature usage.
- **`progress_events`**: `id (SERIAL)`, `user_id`, `content_id (FK)`, `scroll_depth (INT)`, `completed (BOOLEAN)`
  Tracks reading depth percentage and completion status, vital for finding where students drop off during long texts.
- **`watch_events`**: `id (SERIAL)`, `user_id`, `video_id`, `content_id (FK)`, `watched_seconds (INT)`
  Logs accumulated video watch time per session.

---

## ⚡ Performance Decisions

Designing an analytics-heavy learning platform requires specific performance optimizations to prevent tracking logic from bogging down the database and client.

### 1. In-Memory Telemetry Batching
**Decision:** Instead of sending an HTTP `POST` for every video second watched or scroll tick, the React client accumulates values in memory using lightweight `useRef` hooks. 
**Reasoning:** Tracking scroll position or 1-second video intervals normally fires hundreds of requests. `useRef` updates without causing React re-renders, and holding the data client-side reduces network requests by orders of magnitude. 

### 2. Deferring Network Requests with Keep-Alive
**Decision:** The batched analytics data is transmitted exactly once using `fetch('/api/...', { keepalive: true })` inside a `beforeunload` or component unmount lifecycle event.
**Reasoning:** `keepalive: true` instructs the browser to guarantee network transmission in the background even if the user closes the tab mid-request. This guarantees 100% data capture reliability without blocking thread execution or page navigation.

### 3. Append-Only Ledger Database Pattern
**Decision:** The database never updates specific event records (e.g., `UPDATE watch_events SET watched_seconds = ...`). Instead, we perform only `INSERT` queries, summing the results asynchronously. 
**Reasoning:** High-concurrency `UPDATE` queries on the same row can cause row lock contention and slow down the database. An append-only pattern completely eliminates database row locks, allowing PostgreSQL to easily swallow thousands of concurrent writes from telemetry webhooks.

### 4. Client-Side Video Rendering Strategy
**Decision:** Using a custom wrapper (`ClientOnlyPlayer` / explicit `iframe` handling) circumventing Next.js Server-Side Rendering (SSR) for the YouTube iframe integration.
**Reasoning:** Hydrating large third-party iframe APIs during server rendering leads to DOM mismatches and performance warnings. Executing the player strictly client-side offloads rendering overhead from the server, improving Time to First Byte (TTFB) and preventing prop-mangling from `next/dynamic`.

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
