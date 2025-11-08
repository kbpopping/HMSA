require('dotenv').config();
const { Pool } = require('pg');

console.log('\n🔍 Database Connection Diagnostics\n');
console.log('='.repeat(50));

const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'postgres',
  connectionTimeoutMillis: 5000,
};

console.log('Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  User: ${config.user}`);
console.log(`  Database: ${config.database}`);
console.log(`  Password: ${config.password ? '***' : '(not set)'}`);
console.log('');

async function testConnection() {
  const pool = new Pool(config);
  
  try {
    console.log('⏳ Testing connection...');
    const result = await pool.query('SELECT version()');
    console.log('✅ PostgreSQL connection successful!');
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);
    
    // Test if database exists
    if (config.database !== 'postgres') {
      const dbCheck = await pool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [config.database]
      );
      
      if (dbCheck.rows.length === 0) {
        console.log(`\n⚠️  Database "${config.database}" does not exist!`);
        console.log(`   Run: CREATE DATABASE ${config.database};`);
      } else {
        console.log(`✅ Database "${config.database}" exists`);
        
        // Check if tables exist
        const tablesCheck = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('hospitals', 'hospital_users', 'patients')
          ORDER BY table_name
        `);
        
        if (tablesCheck.rows.length === 0) {
          console.log(`\n⚠️  No tables found in database "${config.database}"!`);
          console.log(`   Run: psql -U ${config.user} -d ${config.database} -f schema.sql`);
        } else {
          console.log(`✅ Found ${tablesCheck.rows.length} table(s): ${tablesCheck.rows.map(r => r.table_name).join(', ')}`);
        }
      }
    }
    
    await pool.end();
    console.log('\n✅ All checks passed! You can start the server.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`   Error: ${error.message}`);
    
    // Provide specific guidance based on error
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Solution: PostgreSQL service is not running.');
      console.error('   Start it with: Start-Service postgresql-X-XX');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Solution: Database does not exist.');
      console.error(`   Create it with: CREATE DATABASE ${config.database};`);
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Solution: Wrong username or password.');
      console.error('   Check your .env file (PGUSER, PGPASSWORD)');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Solution: Connection timeout.');
      console.error('   Check if PostgreSQL is running and accessible');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

