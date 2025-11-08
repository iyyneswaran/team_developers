import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // 'user' (Farmer) | 'expert'
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.email || !form.password) throw new Error("Please fill all fields.");

      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }), // backend optionally enforces role
      });

      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.issues?.[0]?.message ||
          data?.message ||
          `Login failed (${res.status})`;
        throw new Error(msg);
      }

      if (!data.token || !data.user) {
        throw new Error("Malformed response from server.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // optional: route by role
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.viewport}>
      <div className={styles.container}>
        <form className={styles.card} onSubmit={onSubmit}>
          <h2 className={styles.title}>Sign in</h2>

          <label className={styles.label}>Role</label>
          <div className={styles.row}>
            <label className={styles.radio}>
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              Farmer
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="role"
                value="expert"
                checked={role === "expert"}
                onChange={() => setRole("expert")}
              />
              Expert
            </label>
          </div>

          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
          />

          <label className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              className={styles.input}
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a11.42 11.42 0 0 1 4.2-5.2"></path>
                  <path d="M1 1l22 22"></path>
                  <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 3-3"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className={styles.footer}>
            New here?{" "}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
