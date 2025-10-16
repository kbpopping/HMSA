require('dotenv').config();
const { Pool } = require('pg');

console.log('Environment variables:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '***' : 'undefined');
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const config = {
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 10,
};

console.log('\nConnection config:', {
  ...config,
  password: config.password ? '***' : 'undefined'
});

const pool = new Pool(config);

async function testConnection() {
  try {
    const result = await pool.query('SELECT 1 as test');
    console.log('\n✅ Database connection successful!');
    console.log('Test query result:', result.rows);
    await pool.end();
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();