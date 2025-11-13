import pool from "../config/db.js";

export async function createUser({ full_name, email, password_hash, phone, role, organization_name, address }) {
  const query = `
    INSERT INTO users (full_name, email, password_hash, phone, role, organization_name, address)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, full_name, email, role;
  `;
  const result = await pool.query(query, [full_name, email, password_hash, phone, role, organization_name, address]);
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

export async function getAllUsers() {
  const result = await pool.query("SELECT id, full_name, email, role, is_active FROM users ORDER BY id");
  return result.rows;
}
