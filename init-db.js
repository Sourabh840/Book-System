const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Dropping old tables...');
    await client.query(`
      DROP TABLE IF EXISTS watch_events CASCADE;
      DROP TABLE IF EXISTS progress_events CASCADE;
      DROP TABLE IF EXISTS click_events CASCADE;
      DROP TABLE IF EXISTS content CASCADE;
      DROP TABLE IF EXISTS chapters CASCADE;
      DROP TABLE IF EXISTS books CASCADE;
    `);

    console.log('Creating tables...');
    await client.query(`
      CREATE TABLE books (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE chapters (
        id UUID PRIMARY KEY,
        book_id UUID REFERENCES books(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE content (
        id UUID PRIMARY KEY,
        chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body_text TEXT,
        video_url VARCHAR(255),
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE click_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        button_label VARCHAR(255) NOT NULL,
        content_id UUID REFERENCES content(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE progress_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        content_id UUID REFERENCES content(id) ON DELETE CASCADE,
        scroll_depth INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE watch_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        video_id VARCHAR(255) NOT NULL,
        content_id UUID REFERENCES content(id) ON DELETE CASCADE,
        watched_seconds INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Inserting seed data...');
    
    const book1_id = '11111111-1111-1111-1111-111111111111';
    const book2_id = 'abcdef01-1234-5678-abcd-ef0123456789';
    
    const ch1_id = '22222222-2222-2222-2222-222222222222';
    const c1_id = '33333333-3333-3333-3333-333333333333';
    const c2_id = '44444444-4444-4444-4444-444444444444';

    await client.query(`
      INSERT INTO books (id, title, description) VALUES
      ($1, 'Advanced React Development', 'Master Next.js, Server Components, and more.'),
      ($2, 'Postgres for Dummies', 'A quick guide to relational databases.')
    `, [book1_id, book2_id]);

    await client.query(`
      INSERT INTO chapters (id, book_id, title, order_index) VALUES
      ($1, $2, 'Getting Started with Next.js', 1)
    `, [ch1_id, book1_id]);

    await client.query(`
      INSERT INTO content (id, chapter_id, title, body_text, video_url, order_index) VALUES
      ($1, $2, 'Introduction to Server Components', 'Welcome to this lesson! In this lesson we will cover the basics of React Server Components (RSC) and why they matter for Next.js App Router performance. \n\n Watch the video to learn more!', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1),
      ($3, $2, 'Routing in Next.js 13+', 'Routing has completely changed in Next.js. We now use the standard App directory structure with nested layouts and page files.', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 2)
    `, [c1_id, ch1_id, c2_id]);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing DB', err);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
