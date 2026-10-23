const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let databaseUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
  if (match) {
    databaseUrl = match[1];
  }
}

const isPostgres = databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'));

console.log('--- Sokher Store Database Setup ---');
if (isPostgres) {
  console.log('Connecting to PostgreSQL database:', databaseUrl.split('@')[1] || 'PostgreSQL');
  try {
    execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', { stdio: 'inherit' });
    execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit' });
    console.log('PostgreSQL schema synchronized successfully!');
  } catch (err) {
    console.error('Failed to sync PostgreSQL. Falling back to local SQLite database...', err.message);
    execSync('npx prisma db push --schema=prisma/schema.sqlite.prisma --accept-data-loss', { stdio: 'inherit' });
    execSync('npx prisma generate --schema=prisma/schema.sqlite.prisma', { stdio: 'inherit' });
  }
} else {
  console.log('No PostgreSQL URL configured or using local mode. Setting up local SQLite database...');
  execSync('npx prisma db push --schema=prisma/schema.sqlite.prisma --accept-data-loss', { stdio: 'inherit' });
  execSync('npx prisma generate --schema=prisma/schema.sqlite.prisma', { stdio: 'inherit' });
  console.log('Local database ready!');
}
