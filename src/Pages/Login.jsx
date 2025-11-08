import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("farmer"); // farmer|expert
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

      // send role so backend can block cross-role login if needed
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

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
                value="farmer"
                checked={role === "farmer"}
                onChange={() => setRole("farmer")}
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
              {showPassword ? "🙈" : "👁️"}
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
