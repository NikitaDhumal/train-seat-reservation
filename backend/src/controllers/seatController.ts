import { Request, Response } from "express";
import { pool } from "../models/db";

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}
export const getSeats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM seats ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seats" });
  }
};

export const bookSeats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { user } = req;
  const { seats } = req.body;

  if (!Array.isArray(seats) || seats.length < 1 || seats.length > 7) {
    res.status(400).json({ message: "You can book between 1 to 7 seats." });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT id FROM seats WHERE id = ANY($1) AND booked_by IS NULL",
      [seats]
    );

    if (result.rows.length !== seats.length) {
      res.status(400).json({ message: "Some seats are already booked." });
      return;
    }

    for (let id of seats) {
      await pool.query("UPDATE seats SET booked_by = $1 WHERE id = $2", [
        user?.id,
        id,
      ]);
    }

    res.status(200).json({ message: "Seats booked successfully", seats });
    return;
  } catch (error) {
    res.status(500).json({ message: "Booking failed" });
    return;
  }
};
export const resetSeats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await pool.query("UPDATE seats SET booked_by = NULL");
    res.status(200).json({ message: "All bookings have been reset." });
  } catch (error) {
    console.error("Reset failed:", error);
    res.status(500).json({ message: "Failed to reset bookings." });
  }
};
