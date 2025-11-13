// src/routes/adminRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getAllUsers, getAllDonations, getAllClaims } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/donations", protect, adminOnly, getAllDonations);
router.get("/claims", protect, adminOnly, getAllClaims);

export default router;
