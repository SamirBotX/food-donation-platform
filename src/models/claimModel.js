// backend/src/models/claimModel.js
import pool from "../config/db.js";

/* --------------------------------------
   ➕ Create a new claim
-------------------------------------- */
export async function createClaim({
  donation_id,
  charity_id,
  quantity,
  pickup_time,
  contact_name,
  phone,
  note,
}) {
  const query = `
    INSERT INTO claims (
      donation_id, charity_id, quantity, pickup_time, contact_name, phone, note
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, donation_id, charity_id, quantity, pickup_time, contact_name, phone, note, status, created_at;
  `;
  const values = [
    donation_id,
    charity_id,
    quantity,
    pickup_time,
    contact_name,
    phone,
    note,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/* --------------------------------------
   📋 Get all claims (admin/global view)
-------------------------------------- */
export async function getAllClaims() {
  const query = `
    SELECT 
      c.id,
      c.donation_id,
      c.charity_id,
      c.quantity,
      c.status,
      c.pickup_time,
      c.contact_name,
      c.phone,
      c.note,
      c.created_at,
      d.title AS donation_title,
      d.pickup_location,
      u1.full_name AS donor_name,
      u1.email AS donor_email,
      u1.phone AS donor_phone,
      u2.full_name AS charity_name,
      u2.email AS charity_email,
      u2.phone AS charity_phone
    FROM claims c
    JOIN donations d ON c.donation_id = d.id
    JOIN users u1 ON d.donor_id = u1.id
    JOIN users u2 ON c.charity_id = u2.id
    ORDER BY c.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

/* --------------------------------------
   📋 Get claims for a specific user
-------------------------------------- */
export async function getClaimsByUser(charity_id) {
  const query = `
    SELECT 
      c.id,
      c.donation_id,
      c.charity_id,
      c.quantity,
      c.status,
      c.pickup_time,
      c.contact_name,
      c.phone,
      c.note,
      c.created_at,
      d.title AS donation_title,
      d.pickup_location,
      u1.full_name AS donor_name,
      u1.email AS donor_email,
      u1.phone AS donor_phone
    FROM claims c
    JOIN donations d ON c.donation_id = d.id
    JOIN users u1 ON d.donor_id = u1.id
    WHERE c.charity_id = $1
    ORDER BY c.created_at DESC;
  `;
  const result = await pool.query(query, [charity_id]);
  return result.rows;
}

/* --------------------------------------
   🔁 Update claim status
-------------------------------------- */
export async function updateClaimStatus(id, status) {
  const query = `
    UPDATE claims
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, donation_id, charity_id, quantity, pickup_time, contact_name, phone, note, status;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
}
