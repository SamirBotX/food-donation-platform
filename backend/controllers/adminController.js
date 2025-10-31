// backend/controllers/adminController.js
import { getAllUsers, getAllDonations, getAllClaims, getSystemReport } from "../models/adminModel.js";

// GET /api/admin/users
export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ error: "Error fetching users" });
  }
};

// GET /api/admin/donations
export const listDonations = async (req, res) => {
  try {
    const donations = await getAllDonations();
    res.json(donations);
  } catch (error) {
    console.error("❌ Error fetching donations:", error.message);
    res.status(500).json({ error: "Error fetching donations" });
  }
};

// GET /api/admin/claims
export const listClaims = async (req, res) => {
  try {
    const claims = await getAllClaims();
    res.json(claims);
  } catch (error) {
    console.error("❌ Error fetching claims:", error.message);
    res.status(500).json({ error: "Error fetching claims" });
  }
};

// GET /api/admin/reports
export const showReport = async (req, res) => {
  try {
    const report = await getSystemReport();
    res.json(report);
  } catch (error) {
    console.error("❌ Error generating report:", error.message);
    res.status(500).json({ error: "Error generating report" });
  }
};
