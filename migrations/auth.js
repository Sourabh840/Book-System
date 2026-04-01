const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runAuthMigration() {
  const client = await pool.connect();
  try {
    console.log('Running auth migration...');

    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Truncate telemetry to flush out dummy data
    await client.query(`
      TRUNCATE TABLE click_events, progress_events, watch_events RESTART IDENTITY CASCADE;
    `);

    console.log('Authentication migration completed. Telemetry cleared for live data collecting!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runAuthMigration();
