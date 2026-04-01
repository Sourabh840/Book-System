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
    const book3_id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1';
    const book4_id = 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2';
    
    const ch1_id = '22222222-2222-2222-2222-222222222222';
    const ch2_id = '55555555-5555-5555-5555-555555555555';
    const ch3_id = 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3';
    const ch4_id = 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4';
    
    const c1_id = '33333333-3333-3333-3333-333333333333';
    const c2_id = '44444444-4444-4444-4444-444444444444';
    const c3_id = 'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5';
    const c4_id = 'b6b6b6b6-b6b6-b6b6-b6b6-b6b6b6b6b6b6';

    await client.query(`
      INSERT INTO books (id, title, description) VALUES
      ($1, 'Modern Control Engineering (Ogata)', 'Comprehensive guide to electrical control systems, Laplace transforms, and root-locus analysis.'),
      ($2, 'Introduction to Algorithms (CLRS)', 'The authoritative textbook on data structures and algorithms for Computer Science.'),
      ($3, 'Power System Analysis', 'Essential principles of electrical power systems, grid stability, and voltage transmission.'),
      ($4, 'Electromagnetic Field Theory', 'Foundational concepts mapping Maxwells equations to practical antenna design.')
    `, [book1_id, book2_id, book3_id, book4_id]);

    await client.query(`
      INSERT INTO chapters (id, book_id, title, order_index) VALUES
      ($1, $2, 'Chapter 1: Mathematical Modeling of Control Systems', 1),
      ($3, $4, 'Chapter 2: Sorting and Order Statistics', 1),
      ($5, $6, 'Chapter 1: The Power Grid', 1),
      ($7, $8, 'Chapter 1: Electrostatics', 1)
    `, [ch1_id, book1_id, ch2_id, book2_id, ch3_id, book3_id, ch4_id, book4_id]);

    await client.query(`
      INSERT INTO content (id, chapter_id, title, body_text, video_url, order_index) VALUES
      ($1, $2, 'Laplace Transforms & Transfer Functions', 'A transfer function represents the relationship between the output and input of a linear time-invariant system in the Laplace domain. Watch the control systems lecture below to understand pole-zero mapping, stability criteria, and how Laplace transforms simplify differential equations into algebraic operations.', 'https://www.youtube.com/watch?v=n2y7n6jw5d0', 1),
      ($3, $4, 'Merge Sort and Asymptotic Analysis', 'Merge sort is a divide-and-conquer algorithm with a strictly guaranteed worst-case running time of O(n log n). The computer science video lecture below dissects the recursion tree and proves the time complexity bound using the master theorem.', 'https://www.youtube.com/watch?v=4VqmGXwpLqc', 1),
      ($5, $6, 'Power Flow Analysis', 'Power flow analysis is critical for maintaining stability across distributed power grids. This lecture covers the Newton-Raphson load flow methodology, bus classification, and how engineers ensure voltage regulation across long transmission lines.', 'https://www.youtube.com/watch?v=AgQDIE6Kk0I', 1),
      ($7, $8, 'Maxwells Equations', 'Understand the four fundamental laws that govern all electromagnetic phenomena — from Faradays law of induction to Amperes circuital law. This lecture builds intuition for how electric and magnetic fields interact and propagate through space.', 'https://www.youtube.com/watch?v=IqV9KR2FXKQ', 1)
    `, [c1_id, ch1_id, c2_id, ch2_id, c3_id, ch3_id, c4_id, ch4_id]);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing DB', err);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
