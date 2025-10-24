// backend/src/config/db.js

import pkg from "pg";          // Import PostgreSQL client
import dotenv from "dotenv";   // Import dotenv to read .env file

dotenv.config();               // Load variables from .env file

const { Pool } = pkg;          // Create a connection pool class from pg

// Create a new connection pool using the database URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection (runs once when the app starts)
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL Database"))
  .catch((err) => console.error("❌ Database connection error:", err.message));

// Export this pool so we can use it in other files
export default pool;
