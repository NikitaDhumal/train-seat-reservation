import Navbar from "@/components/Navbar";
import SeatGrid from "@/components/SeatGrid";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) router.push("/login");
  // }, []);
  return (
    <div>
      {/* <Navbar /> */}
      <div className="container py-3">
        <h1 className="mb-4">Train Seat Reservation</h1>
        <SeatGrid />
      </div>
    </div>
  );
}
