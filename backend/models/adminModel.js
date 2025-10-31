// backend/models/adminModel.js
import pool from "../src/config/db.js";

// 1️⃣ Get all users
export const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT id, email, full_name, organization_name, role, phone, created_at
    FROM users
    ORDER BY created_at DESC;
  `);
  return result.rows;
};

// 2️⃣ Get all donations with donor info
export const getAllDonations = async () => {
  const result = await pool.query(`
    SELECT d.*, u.full_name AS donor_name, u.organization_name AS donor_org
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    ORDER BY d.created_at DESC;
  `);
  return result.rows;
};

// 3️⃣ Get all claims with user and donation info
export const getAllClaims = async () => {
  const result = await pool.query(`
    SELECT c.*, 
           u.full_name AS claimed_by_name, 
           d.title AS donation_title
    FROM claims c
    JOIN users u ON c.claimed_by_user = u.id
    JOIN donations d ON c.donation_id = d.id
    ORDER BY c.created_at DESC;
  `);
  return result.rows;
};

// 4️⃣ Generate system-wide stats
export const getSystemReport = async () => {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM donations) AS total_donations,
      (SELECT COUNT(*) FROM claims) AS total_claims,
      (SELECT COUNT(*) FROM donations WHERE status = 'open') AS open_donations,
      (SELECT COUNT(*) FROM donations WHERE status = 'claimed') AS claimed_donations,
      (SELECT COUNT(*) FROM donations WHERE status = 'closed') AS closed_donations;
  `);
  return result.rows[0];
};
