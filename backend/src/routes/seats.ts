import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getSeats, bookSeats, resetSeats } from "../controllers/seatController";

const router = express.Router();

router.get("/", authenticateToken, getSeats);
router.post("/book", authenticateToken, bookSeats);
router.post("/reset", resetSeats);

export default router;
