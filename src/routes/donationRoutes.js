import express from "express";
import {
  getAllDonations,
  getPublicAvailableDonations,
  createDonation,
  getMyDonations,
  getDonationClaims,
  updateDonation,
  deleteDonation,
  getDonationById,
} from "../controllers/donationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧾 Public
router.get("/public/available", getPublicAvailableDonations);

// 👤 Donor routes
router.get("/my", protect, getMyDonations);            // donor dashboard
router.get("/:id", protect, getDonationById);          // (edit)
router.get("/:id/claims", protect, getDonationClaims);
router.post("/", protect, createDonation);
router.put("/:id", protect, updateDonation);
router.delete("/:id", protect, deleteDonation);

// 🧩 Admin
router.get("/", protect, getAllDonations);

export default router;
