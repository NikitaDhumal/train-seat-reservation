import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async () => {
    setError("");

    // ✅ Validations
    if (!name.trim()) return setError("Name is required");
    if (!email.trim() || !validateEmail(email))
      return setError("Enter a valid email");
    if (!password || password.length < 6)
      return setError("Password must be at least 6 characters");

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/signup", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex vh-100 align-items-center justify-content-center">
      <div
        className="bg-white p-4 rounded shadow w-100"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="mb-4">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          className="form-control mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-success w-100"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div className="text-danger mt-2">{error}</div>}
        <p className="text-center m-0 mt-3">
          Already have an account?{" "}
          <span
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
