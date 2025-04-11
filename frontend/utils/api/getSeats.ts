import axios from "axios";
import { toast } from "react-toastify"; // or any toast library

export const fetchSeatsAPI = async () => {
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  try {
    const response = await axios.get(
      "http://localhost:5000/api/seats",
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.status, error.message);

      // Optionally show user-friendly message
      if (error.response?.status === 403) {
        toast.error("You are not authorized. Please login.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      console.error("Unexpected error:", error);
      toast.error("Unexpected error occurred.");
    }

    return null; // return a fallback so app doesn't break
  }
};
