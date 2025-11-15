// backend/src/controllers/claimController.js
import pool from "../config/db.js";

/**
 * ➕ Create a new claim (with full validation)
 */
export const createClaim = async (req, res) => {
  try {
    const { donation_id, quantity, pickup_time } = req.body;
    const charity_id = req.user.id;

    if (!donation_id || !quantity || !pickup_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate pickup time (cannot be in past)
    const now = new Date();
    const pickupDate = new Date(pickup_time);

    if (pickupDate < now) {
      return res.status(400).json({
        error: "Pickup time cannot be in the past",
      });
    }

    // Get donation
    const donationRes = await pool.query(
      `
      SELECT quantity, status, expires_at 
      FROM donations 
      WHERE id = $1
      `,
      [donation_id]
    );

    if (donationRes.rowCount === 0)
      return res.status(404).json({ error: "Donation not found" });

    const donation = donationRes.rows[0];

    // Check expires
    if (donation.expires_at && new Date(donation.expires_at) < now) {
      return res.status(400).json({
        error: "This donation has expired",
      });
    }

    if (donation.status === "claimed")
      return res.status(400).json({ error: "This donation is fully claimed" });

    // Check remaining
    const claimedRes = await pool.query(
      `
      SELECT COALESCE(SUM(quantity), 0) AS total_claimed 
      FROM claims 
      WHERE donation_id = $1 AND status != 'cancelled'
      `,
      [donation_id]
    );

    const alreadyClaimed = Number(claimedRes.rows[0].total_claimed);
    const remaining = donation.quantity - alreadyClaimed;

    if (quantity > remaining) {
      return res.status(400).json({
        error: `Only ${remaining} portions available.`,
      });
    }

    // Insert claim
    const result = await pool.query(
      `
      INSERT INTO claims (
        donation_id, charity_id, quantity, pickup_time, status
      ) VALUES ($1, $2, $3, $4, 'reserved')
      RETURNING *
      `,
      [donation_id, charity_id, quantity, pickup_time]
    );

    // Fully claimed? update status
    const newTotal = alreadyClaimed + quantity;
    if (newTotal >= donation.quantity) {
      await pool.query(
        "UPDATE donations SET status='claimed' WHERE id=$1",
        [donation_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating claim:", err.message);
    res.status(500).json({ error: "Failed to create claim" });
  }
};

/**
 * 👤 Charity — Get my claims
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
        c.picked_up_at,
        c.created_at AS claimed_at,

        d.id AS donation_id,
        d.title AS donation_title,
        d.description,
        d.food_type,
        d.pickup_location,
        d.pickup_instructions,
        d.image_url,
        d.unit,
        d.quantity AS total_quantity,
        d.expires_at,

        u.full_name AS donor_name
      FROM claims c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.donor_id = u.id
      WHERE c.charity_id = $1
      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching my claims:", err.message);
    res.status(500).json({ error: "Failed to load your claims" });
  }
};

/**
 * 👨‍🍳 Donor — View claims for specific donation
 */
export const getDonationClaims = async (req, res) => {
  try {
    const donorId = req.user.id;
    const donationId = req.params.id;

    const result = await pool.query(
      `
      SELECT
        c.id AS claim_id,
        c.quantity,
        c.pickup_time,
        c.status,
        c.picked_up_at,

        u.full_name AS charity_name,
        u.email AS charity_email
      FROM claims c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON u.id = c.charity_id
      WHERE d.id = $1 AND d.donor_id = $2
      ORDER BY c.created_at DESC
      `,
      [donationId, donorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error loading donation claims:", err.message);
    res.status(500).json({ error: "Failed to load donation claims" });
  }
};

/**
 * 🟢 Donor marks a claim as picked up
 */
export const markClaimPickedUp = async (req, res) => {
  try {
    const claimId = req.params.id;

    const result = await pool.query(
      `
      UPDATE claims
      SET status='picked_up', picked_up_at=NOW()
      WHERE id=$1 AND status='reserved'
      RETURNING *
      `,
      [claimId]
    );

    if (result.rowCount === 0)
      return res
        .status(400)
        .json({ error: "Cannot mark as picked up (maybe already picked/cancelled)" });

    res.json({ message: "Claim marked as picked up", claim: result.rows[0] });
  } catch (err) {
    console.error("❌ Error picking up:", err.message);
    res.status(500).json({ error: "Failed to update claim" });
  }
};

/**
 * 🔴 Donor or Charity cancels claim
 */
export const cancelClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    // Get claim
    const claimRes = await pool.query(
      `
      SELECT donation_id, quantity
      FROM claims
      WHERE id=$1
      `,
      [claimId]
    );

    if (claimRes.rowCount === 0)
      return res.status(404).json({ error: "Claim not found" });

    const { donation_id } = claimRes.rows[0];

    // Cancel claim
    await pool.query(
      `
      UPDATE claims
      SET status='cancelled', updated_at=NOW()
      WHERE id=$1
      `,
      [claimId]
    );

    // Recalculate claimed quantity
    const sumRes = await pool.query(
      `
      SELECT COALESCE(SUM(quantity),0) AS total_claimed
      FROM claims
      WHERE donation_id=$1 AND status!='cancelled'
      `,
      [donation_id]
    );

    const claimedNow = Number(sumRes.rows[0].total_claimed);

    const donationRes = await pool.query(
      "SELECT quantity FROM donations WHERE id=$1",
      [donation_id]
    );

    const totalQty = donationRes.rows[0].quantity;

    const newStatus = claimedNow >= totalQty ? "claimed" : "open";

    await pool.query(
      "UPDATE donations SET status=$1 WHERE id=$2",
      [newStatus, donation_id]
    );

    res.json({ message: "Claim cancelled successfully" });
  } catch (err) {
    console.error("❌ Error cancelling claim:", err.message);
    res.status(500).json({ error: "Failed to cancel claim" });
  }
};

/**
 * ❌ Admin/charity delete claim completely
 */
export const deleteClaim = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM claims WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Claim not found" });

    res.json({ message: "Claim deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete claim" });
  }
};
