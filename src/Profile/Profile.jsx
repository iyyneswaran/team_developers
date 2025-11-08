import React, { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { FiEdit } from "react-icons/fi";
import Navbar from "../nav/Navbar";
import avatar from "../assets/avatar/avatar_farm.png";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
  const NAV_HEIGHT = 76;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const cached = localStorage.getItem("user");
          if (cached) setUser(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        console.error("Profile load error", err);
        const cached = localStorage.getItem("user");
        if (cached) setUser(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className={styles.viewport}>
        <div className={styles.container}>
          <div className={styles.detailsCard}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.viewport}>
        <div className={styles.container}>
          <div className={styles.detailsCard}>
            <h3 className={styles.sectionTitle}>Not signed in</h3>
            <p style={{ margin: 8 }}>Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const { name, email, phone, role, soilType, address } = user;

  return (
    <div className={styles.viewport}>
      <div
        className={styles.container}
        style={{ paddingBottom: NAV_HEIGHT + 18 }}
      >
        {/* Header */}
        <div className={styles.headerCard}>
          <div className={styles.gradientHeader} />
          <button className={styles.editBtn}>
            <FiEdit className={styles.editIcon} />
            Edit
          </button>

          <div className={styles.avatarWrap}>
            <div className={styles.avatarCircle}>
              <span className={styles.avatarEmoji}>
                <img className={styles.avatar} alt="avatar" src={avatar} />
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailsCard}>
          <h3 className={styles.sectionTitle}>Profile summary</h3>

          <label className={styles.fieldLabel}>Name</label>
          <div className={styles.inputBox}>{name || "-"}</div>

          <label className={styles.fieldLabel}>Email</label>
          <div className={styles.inputBox}>{email || "-"}</div>

          <label className={styles.fieldLabel}>Mobile number</label>
          <div className={styles.inputBox}>{phone || "-"}</div>

          <label className={styles.fieldLabel}>Role</label>
          <div className={styles.inputBox}>
            {role === "user" ? "farmer" : role || "-"}
          </div>

          {role === "user" && soilType && (
            <>
              <label className={styles.fieldLabel}>Soil / Land Type</label>
              <div className={styles.inputBox}>{soilType}</div>
            </>
          )}

          <h4 className={styles.subTitle}>Address</h4>

          <label className={styles.fieldLabel}>Pincode</label>
          <div className={styles.inputBox}>{address?.pincode || "-"}</div>

          <label className={styles.fieldLabel}>State</label>
          <div className={styles.inputBox}>{address?.state || "-"}</div>

          <label className={styles.fieldLabel}>District</label>
          <div className={styles.inputBox}>{address?.district || "-"}</div>

          <label className={styles.fieldLabel}>City</label>
          <div className={styles.inputBox}>{address?.city || "-"}</div>

          <div style={{ height: NAV_HEIGHT }} />
          {typeof Navbar === "function" ? <Navbar /> : null}
        </div>
      </div>
    </div>
  );
}
