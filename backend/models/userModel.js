// backend/models/userModel.js
import pool from "../src/config/db.js";
import bcrypt from "bcrypt";

// Get all users
export async function getAllUsers() {
  const result = await pool.query("SELECT id, email, full_name, organization_name, role, phone, created_at FROM users ORDER BY id ASC");
  return result.rows;
}

// Register a new user
export async function registerUser({ email, password, full_name, organization_name, role, phone }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (email, password_hash, full_name, organization_name, role, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, full_name, organization_name, role, phone, created_at;
  `;
  const values = [email, hashedPassword, full_name, organization_name, role, phone];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Login user (check email + password)
export async function loginUser({ email, password }) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) return null; // User not found

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) return null;

  // Don’t return password_hash
  delete user.password_hash;
  return user;
}
