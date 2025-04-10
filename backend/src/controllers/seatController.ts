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
  const { count } = req.body;

  if (!count || count < 1 || count > 7) {
    res.status(400).json({ message: "You can book between 1 to 7 seats" });
    return;
  }

  try {
    const seatData = await pool.query(
      "SELECT * FROM seats WHERE booked_by IS NULL ORDER BY row_number, seat_number"
    );
    const availableSeats = seatData.rows;

    if (availableSeats.length < count) {
      res.status(400).json({ message: "Not enough seats available" });
      return;
    }

    const rows: Record<number, any[]> = {};
    availableSeats.forEach((seat) => {
      if (!rows[seat.row_number]) rows[seat.row_number] = [];
      rows[seat.row_number].push(seat);
    });

    let selectedSeats: any[] = [];
    for (let row in rows) {
      if (rows[row].length >= count) {
        selectedSeats = rows[row].slice(0, count);
        break;
      }
    }

    if (selectedSeats.length < count) {
      selectedSeats = availableSeats.slice(0, count);
    }

    const bookedIds = selectedSeats.map((seat) => seat.id);

    for (let id of bookedIds) {
      await pool.query("UPDATE seats SET booked_by = $1 WHERE id = $2", [
        user?.id,
        id,
      ]);
    }

    res
      .status(200)
      .json({ message: "Seats booked successfully", seats: bookedIds });
  } catch (error) {
    res.status(500).json({ message: "Booking failed" });
  }
};
