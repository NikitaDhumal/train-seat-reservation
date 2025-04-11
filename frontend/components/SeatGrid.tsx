import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchSeatsAPI } from "@/utils/api/getSeats";
import resetSeatsAPI from "@/utils/api/postResetSeats";

interface Seat {
  id: number;
  row_number: number;
  seat_number: number;
  booked_by: number;
}

export default function SeatBookingPage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatCount, setSeatCount] = useState(1);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const loadSeats = async () => {
    const data = await fetchSeatsAPI();
    if (data) setSeats(data); // update only if not null
  };
  useEffect(() => {
    loadSeats();
  }, []);

  const handleSelect = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length < 7) {
        setSelectedSeats((prev) => [...prev, seatId]);
      }
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all bookings?"
    );
    if (!confirmReset) return;

    try {
      await axios.post("http://localhost:5000/api/seats/reset");

      toast.success("All bookings have been reset");
      loadSeats(); // Refresh seat map
      setSelectedSeats([]); // Clear selected seats
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Reset failed");
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Reset error:", error);
    }
  };

  const handleBooking = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/seats/book",
        { seats: selectedSeats },
        getAuthHeaders()
      );
      toast.success("Booking successful!");
      setSelectedSeats([]);
      loadSeats();
    } catch (err) {
      toast.error("Booking failed!");
    }
  };

  const suggestSeats = () => {
    const available = seats.filter((s) => !s.booked_by);
    const maxRow = Math.max(...seats.map((s) => s.row_number));
    let suggestion: number[] = [];

    for (let row = 1; row <= maxRow; row++) {
      // All seats in the row sorted by seat_number
      const rowSeats = seats
        .filter((s) => s.row_number === row)
        .sort((a, b) => a.seat_number - b.seat_number);

      // Filter out only the available ones
      const availableInRow = rowSeats.filter((s) => !s.booked_by);

      // Skip if row doesn't have enough available seats
      if (availableInRow.length < seatCount) continue;

      // Look for contiguous block in that row
      for (let i = 0; i <= availableInRow.length - seatCount; i++) {
        const block = availableInRow.slice(i, i + seatCount);
        const isContiguous = block.every(
          (s, idx) =>
            idx === 0 || s.seat_number === block[idx - 1].seat_number + 1
        );

        if (isContiguous) {
          suggestion = block.map((s) => s.id);
          break;
        }
      }

      if (suggestion.length > 0) break; // Break outer loop if found
    }

    // Fallback if no contiguous block found, just suggest nearest available
    if (suggestion.length === 0 && available.length >= seatCount) {
      const sorted = available.sort(
        (a, b) => a.row_number - b.row_number || a.seat_number - b.seat_number
      );
      suggestion = sorted.slice(0, seatCount).map((s) => s.id);
    }

    if (suggestion.length === 0) {
      toast.error("Not enough contiguous seats available");
    } else {
      setSelectedSeats(suggestion);
    }
  };

  // Group into rows (7 per row)
  const seatRows: Seat[][] = [];
  for (let i = 0; i < seats.length; i += 7) {
    seatRows.push(seats.slice(i, i + 7));
  }

  return (
    <div className="container my-4">
      <div className="row">
        {/* ----------- Form Section ----------- */}
        <div className="mb-4 p-4 border rounded shadow-sm bg-light col-12 col-md-6">
          <h5 className="mb-3">Train Seat Booking</h5>

          <label className="form-label">Number of seats to book (1-7):</label>
          <input
            type="number"
            min={1}
            max={7}
            value={seatCount}
            onChange={(e) => setSeatCount(Number(e.target.value))}
            className="form-control mb-3"
          />

          <div className="d-flex gap-3 flex-wrap">
            <button className="btn btn-outline-primary" onClick={suggestSeats}>
              Select Seats
            </button>
            <button
              className="btn btn-success"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
            >
              Book Selected Seats
            </button>
            <button className="btn btn-outline-danger" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* ----------- Seat Grid Section ----------- */}
        <div className="col-12 col-md-6">
          <h6 className="mb-3 text-center">Seat Layout</h6>
          <div className="d-flex flex-column gap-2">
            {seatRows.map((row, rowIdx) => (
              <div className="d-flex gap-2 justify-content-center" key={rowIdx}>
                {row.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSelect(seat.id)}
                    className={`btn btn-sm ${
                      seat.booked_by
                        ? "btn-danger disabled"
                        : selectedSeats.includes(seat.id)
                        ? "btn-success"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {seat.id}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
