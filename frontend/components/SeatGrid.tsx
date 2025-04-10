import { useEffect, useState } from "react";
import axios from "axios";

interface Seat {
  id: number;
  row: number;
  col: number;
  isBooked: boolean;
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

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/seats",
        getAuthHeaders()
      );
      setSeats(res.data);
    } catch (err) {
      console.error("Failed to fetch seats:", err);
    }
  };

  const handleSelect = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length < 7) {
        setSelectedSeats((prev) => [...prev, seatId]);
      }
    }
  };

  const handleReset = () => {
    setSelectedSeats([]);
  };

  const handleBooking = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/seats/book",
        { seats: selectedSeats },
        getAuthHeaders()
      );
      alert("Booking successful!");
      setSelectedSeats([]);
      fetchSeats();
    } catch (err) {
      alert("Booking failed. Please try again.");
    }
  };

  const suggestSeats = () => {
    const available = seats.filter((s) => !s.isBooked);
    let suggestion: number[] = [];

    for (let row = 1; row <= Math.max(...seats.map((s) => s.row)); row++) {
      const rowSeats = available
        .filter((s) => s.row === row)
        .sort((a, b) => a.col - b.col);

      for (let i = 0; i <= rowSeats.length - seatCount; i++) {
        const block = rowSeats.slice(i, i + seatCount);
        const isContiguous = block.every(
          (s, idx) => idx === 0 || s.col === block[idx - 1].col + 1
        );
        if (isContiguous) {
          suggestion = block.map((s) => s.id);
          break;
        }
      }

      if (suggestion.length > 0) break;
    }

    if (suggestion.length === 0) {
      suggestion = available.slice(0, seatCount).map((s) => s.id);
    }

    setSelectedSeats(suggestion);
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
        <div className="mb-4 p-4 border rounded shadow-sm bg-light col-6">
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
        <div className="col-6">
          <h6 className="mb-3 text-center">Seat Layout</h6>
          <div className="d-flex flex-column gap-2">
            {seatRows.map((row, rowIdx) => (
              <div className="d-flex gap-2 justify-content-center" key={rowIdx}>
                {row.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSelect(seat.id)}
                    className={`btn btn-sm ${
                      seat.isBooked
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
