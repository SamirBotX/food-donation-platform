// backend/routes/adminRoutes.js
import express from "express";
import { listUsers, listDonations, listClaims, showReport } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", listUsers);
router.get("/donations", listDonations);
router.get("/claims", listClaims);
router.get("/reports", showReport);

export default router;
