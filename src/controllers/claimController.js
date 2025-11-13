// backend/src/controllers/claimController.js
import pool from "../config/db.js";

/**
 * ➕ Create a new claim (partial claim supported)
 */
export const createClaim = async (req, res) => {
  try {
    const { donation_id, quantity, pickup_time } = req.body;
    const charity_id = req.user.id; // ✅ use logged-in user's ID

    if (!donation_id || !quantity || !pickup_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Get donation info
    const donationRes = await pool.query(
      "SELECT quantity, status FROM donations WHERE id = $1",
      [donation_id]
    );

    if (donationRes.rowCount === 0)
      return res.status(404).json({ error: "Donation not found" });

    const donation = donationRes.rows[0];

    if (donation.status === "claimed") {
      return res
        .status(400)
        .json({ error: "This donation is already fully claimed" });
    }

    // 2️⃣ Calculate already claimed portions
    const claimedRes = await pool.query(
      "SELECT COALESCE(SUM(quantity), 0) AS total_claimed FROM claims WHERE donation_id = $1",
      [donation_id]
    );

    const totalClaimed = Number(claimedRes.rows[0].total_claimed);
    const remaining = donation.quantity - totalClaimed;

    if (quantity > remaining) {
      return res
        .status(400)
        .json({ error: `Only ${remaining} portions available to claim.` });
    }

    // 3️⃣ Insert new claim
    const claimResult = await pool.query(
      `
      INSERT INTO claims (
        donation_id, charity_id, quantity, pickup_time, status
      )
      VALUES ($1, $2, $3, $4, 'reserved')
      RETURNING *
      `,
      [donation_id, charity_id, quantity, pickup_time]
    );

    // 4️⃣ If fully claimed, mark donation as claimed
    const newTotalClaimed = totalClaimed + quantity;

    if (newTotalClaimed >= donation.quantity) {
      await pool.query(
        "UPDATE donations SET status = 'claimed' WHERE id = $1",
        [donation_id]
      );
    }

    res.status(201).json(claimResult.rows[0]);
  } catch (err) {
    console.error("❌ Error creating claim:", err.message);
    res.status(500).json({ error: "Failed to create claim" });
  }
};

/**
 * 👤 Get claims for the logged-in charity/individual
 */
export const getMyClaims = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        c.id AS claim_id,
        c.quantity AS claimed_quantity,
        c.pickup_time,
        c.status AS claim_status,
        c.created_at AS claimed_at,
        d.id AS donation_id,
        d.title AS donation_title,
        d.description AS donation_description,
        d.pickup_location,
        d.food_type,
        d.quantity AS total_quantity,
        d.unit,
        d.image_url AS donation_image,
        u_donor.full_name AS donor_name
      FROM claims c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u_donor ON d.donor_id = u_donor.id
      WHERE c.charity_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching user claims:", err.message);
    res.status(500).json({ error: "Failed to load your claims" });
  }
};

/**
 * 🧾 Get all claims (admin or donor view)
 */
export const getAllClaims = async (req, res) => {
  try {
    let result;

    if (req.user.role === "admin") {
      result = await pool.query(`
        SELECT 
          c.id AS claim_id,
          c.quantity AS claimed_quantity,
          c.pickup_time,
          c.status AS claim_status,
          c.created_at AS claimed_at,
          d.id AS donation_id,
          d.title AS donation_title,
          d.description AS donation_description,
          d.pickup_location,
          d.food_type,
          d.image_url,
          d.quantity AS total_quantity,
          d.unit,
          u_donor.full_name AS donor_name,
          u_charity.full_name AS charity_name
        FROM claims c
        JOIN donations d ON c.donation_id = d.id
        JOIN users u_donor ON d.donor_id = u_donor.id
        JOIN users u_charity ON c.charity_id = u_charity.id
        ORDER BY c.created_at DESC
      `);
    } else {
      result = await pool.query(
        `
        SELECT 
          c.id AS claim_id,
          c.quantity AS claimed_quantity,
          c.pickup_time,
          c.status AS claim_status,
          c.created_at AS claimed_at,
          d.id AS donation_id,
          d.title AS donation_title,
          d.description AS donation_description,
          d.pickup_location,
          d.food_type,
          d.image_url AS donation_image,
          d.quantity AS total_quantity,
          d.unit
        FROM claims c
        JOIN donations d ON c.donation_id = d.id
        WHERE c.charity_id = $1
        ORDER BY c.created_at DESC
        `,
        [req.user.id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching claims:", err.message);
    res.status(500).json({ error: "Failed to load claims" });
  }
};

/**
 * ❌ Delete a claim
 */
export const deleteClaim = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM claims WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Claim not found" });

    res.json({ message: "Claim deleted successfully" });
  } catch (err) {
    console.error("Error deleting claim:", err.message);
    res.status(500).json({ error: "Failed to delete claim" });
  }
};
