import React, { useState } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("farmer"); // farmer|expert
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    soilType: "",
    pincode: "",
    state: "",
    district: "",
    city: "",
  });
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
      if (!form.name || !form.email || !form.password)
        throw new Error("Please fill all required fields.");

      if (role === "farmer" && !form.soilType)
        throw new Error("Please provide soil / land type.");

      // Map to backend:
      // role: farmer -> user
      const body = {
        role, // backend will normalize to user/expert; sending farmer is okay
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        soilType: form.soilType || undefined, // backend maps to soil_type
        pincode: form.pincode || undefined,
        state: form.state || undefined,
        district: form.district || undefined,
        city: form.city || undefined,
      };

      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/profile");
    } catch (err) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.viewport}>
      <div className={styles.container}>
        <form className={styles.card} onSubmit={onSubmit}>
          <h2 className={styles.title}>Create account</h2>

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

          <label className={styles.label}>Full name</label>
          <input
            className={styles.input}
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />

          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />

          <label className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
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

          <label className={styles.label}>Phone number</label>
          <input
            className={styles.input}
            name="phone"
            value={form.phone}
            onChange={onChange}
          />

          {role === "farmer" && (
            <>
              <label className={styles.label}>Soil / Land Type</label>
              <input
                className={styles.input}
                name="soilType"
                value={form.soilType}
                onChange={onChange}
                placeholder="e.g. Red loam, Sandy"
                required
              />
            </>
          )}

          <h4 className={styles.sectionTitle}>Address</h4>
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Pincode</label>
              <input
                className={styles.input}
                name="pincode"
                value={form.pincode}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={styles.label}>State</label>
              <input
                className={styles.input}
                name="state"
                value={form.state}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={styles.label}>District</label>
              <input
                className={styles.input}
                name="district"
                value={form.district}
                onChange={onChange}
              />
            </div>
            <div>
              <label className={styles.label}>City</label>
              <input
                className={styles.input}
                name="city"
                value={form.city}
                onChange={onChange}
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className={styles.footer}>
            Already have an account?{" "}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
