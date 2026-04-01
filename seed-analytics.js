const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAnalytics() {
  const client = await pool.connect();
  try {
    console.log('Seeding dummy analytics data...');
    
    const c1_id = '33333333-3333-3333-3333-333333333333';
    const c2_id = '44444444-4444-4444-4444-444444444444';

    // Clear old analytics to have a clean dashboard slate
    await client.query('TRUNCATE TABLE click_events, progress_events, watch_events RESTART IDENTITY CASCADE;');

    // Insert Dummy Clicks
    for (let i = 0; i < 45; i++) {
       await client.query(`
         INSERT INTO click_events (user_id, button_label, content_id)
         VALUES ($1, $2, $3)
       `, [`user_${Math.floor(Math.random() * 100)}`, 'Take Quiz', c1_id]);
    }

    for (let i = 0; i < 112; i++) {
       await client.query(`
         INSERT INTO click_events (user_id, button_label, content_id)
         VALUES ($1, $2, $3)
       `, [`user_${Math.floor(Math.random() * 100)}`, 'Mark as Complete', c1_id]);
    }

    // Insert Dummy Progress (Scroll Depth)
    for (let i = 0; i < 150; i++) {
       // average 80% for c1
       const depth = Math.min(100, Math.floor(Math.random() * 40) + 60);
       await client.query(`
         INSERT INTO progress_events (user_id, content_id, scroll_depth, completed)
         VALUES ($1, $2, $3, $4)
       `, [`user_${i}`, c1_id, depth, depth >= 90]);
    }

    for (let i = 0; i < 120; i++) {
       // average 40% for c2 (showing drop-off)
       const depth = Math.min(100, Math.floor(Math.random() * 80) + 10);
       await client.query(`
         INSERT INTO progress_events (user_id, content_id, scroll_depth, completed)
         VALUES ($1, $2, $3, $4)
       `, [`user_${i}`, c2_id, depth, depth >= 90]);
    }

    // Insert Dummy Watch Time
    for (let i = 0; i < 200; i++) {
       // average 45 seconds for c1
       const seconds = Math.floor(Math.random() * 90) + 10;
       await client.query(`
         INSERT INTO watch_events (user_id, video_id, content_id, watched_seconds)
         VALUES ($1, $2, $3, $4)
       `, [`user_${i}`, `video_${c1_id}`, c1_id, seconds]);
    }

    for (let i = 0; i < 80; i++) {
       // average 120 seconds for c2
       const seconds = Math.floor(Math.random() * 200) + 20;
       await client.query(`
         INSERT INTO watch_events (user_id, video_id, content_id, watched_seconds)
         VALUES ($1, $2, $3, $4)
       `, [`user_${i}`, `video_${c2_id}`, c2_id, seconds]);
    }

    console.log('Dummy analytics data inserted successfully!');
  } catch (err) {
    console.error('Error seeding DB', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedAnalytics();
