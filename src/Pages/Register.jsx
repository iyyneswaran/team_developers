import React, { useState } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = `${BACKEND_URL}/api`;

export default function Register() {
  const navigate = useNavigate();
  const [roleUI, setRoleUI] = useState("farmer"); // UI role
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

  const roleForServer = roleUI === "farmer" ? "user" : "expert";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.name || !form.email || !form.password)
        throw new Error("Please fill all required fields.");
      if (roleUI === "farmer" && !form.soilType)
        throw new Error("Please provide soil / land type.");

      const body = {
        role: roleForServer,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        // backend expects soil_type; we send both for safety
        soil_type: form.soilType,
        soilType: form.soilType,
        pincode: form.pincode,
        state: form.state,
        district: form.district,
        city: form.city,
      };

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.issues?.[0]?.message || data?.message || "Registration failed";
        throw new Error(msg);
      }

      if (!data?.token || !data?.user) {
        throw new Error("Invalid response from server");
      }

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
                checked={roleUI === "farmer"}
                onChange={() => setRoleUI("farmer")}
              />
              Farmer
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="role"
                value="expert"
                checked={roleUI === "expert"}
                onChange={() => setRoleUI("expert")}
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

          <label className={styles.label}>Phone number</label>
          <input
            className={styles.input}
            name="phone"
            value={form.phone}
            onChange={onChange}
          />

          {roleUI === "farmer" && (
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
