import { app } from "./app";
import http from "http";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envPath = path.resolve(__dirname, envFile);

console.log(`🔧 Attempting to load environment from: ${envPath}`);

// Try to load the specific environment file, fallback to .env
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log(`⚠️  Failed to load ${envFile}, trying .env fallback`);
    dotenv.config();
    console.log(`📄 Loaded environment from: .env (fallback)`);
  } else {
    console.log(`📄 Successfully loaded environment from: ${envFile}`);
  }
} catch (error) {
  console.log(`⚠️  Error loading environment: ${error}`);
  dotenv.config();
  console.log(`📄 Loaded environment from: .env (fallback)`);
}

const httpsServer = http.createServer(app);

const PORT = process.env.PORT || 3001;

httpsServer.listen(PORT, async () => {
  console.log(`🚀 BoatOwner API Server running on port ${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  
  // Test database connection
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./utilities');
      await prisma.$connect();
      console.log(`✅ Database connection successful`);
    } catch (error) {
      console.error(`❌ Database connection failed:`, error);
    }
  }
});

