// backend/routes/donationRoutes.js
import express from "express";
import { addDonation, listDonations, viewDonation, changeDonationStatus } from "../controllers/donationController.js";

const router = express.Router();

router.post("/", addDonation); // Add new donation
router.get("/", listDonations); // Get all donations
router.get("/:id", viewDonation); // Get one donation
router.put("/:id/status", changeDonationStatus); // Update status

export default router;
