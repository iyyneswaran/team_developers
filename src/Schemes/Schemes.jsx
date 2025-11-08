import React from "react";
import styles from "./Schemes.module.css";
import { FiCircle } from "react-icons/fi";
import Navbar from "../nav/Navbar";

const central = [
    {
        title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        desc: "Income support of ₹6,000 per year to landholding farmer families.",
    },
    {
        title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        desc: "Income support of ₹6,000 per year to landholding farmer families.",
    },
    {
        title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        desc: "Income support of ₹6,000 per year to landholding farmer families.",
    },
];

const tn = [
    {
        title: "Minor Irrigation Scheme",
        desc:
            "Construction of tube wells in alluvial soil. Revitalisation of open wells by deepening in hard rock areas. Selection of sites for construction of open wells and bore wells.",
    },
    {
        title: "Minor Irrigation Scheme",
        desc:
            "Construction of tube wells in alluvial soil. Revitalisation of open wells by deepening in hard rock areas. Selection of sites for construction of open wells and bore wells.",
    },
];

export default function Schemes() {
    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Schemes</h2>

            {/* Central schemes */}
            <div className={styles.section}>
                <div className={styles.pillRow}>
                    <span className={`${styles.pill} ${styles.pillBlue}`}>
                        <FiCircle className={styles.pillIcon} />
                        Central schemes
                    </span>
                </div>

                <div className={styles.list}>
                    {central.map((s, idx) => (
                        <div className={styles.card} key={`central-${idx}`}>
                            <div className={styles.cardInner}>
                                <h3 className={styles.cardTitle}>{s.title}</h3>
                                <p className={styles.cardDesc}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tamilnadu schemes */}
            <div className={styles.section}>
                <div className={styles.pillRow}>
                    <span className={`${styles.pill} ${styles.pillPurple}`}>
                        <FiCircle className={styles.pillIcon} />
                        Tamilnadu schemes
                    </span>
                </div>

                <div className={styles.list}>
                    {tn.map((s, idx) => (
                        <div className={styles.card} key={`tn-${idx}`}>
                            <div className={styles.cardInner}>
                                <h3 className={styles.cardTitle}>{s.title}</h3>
                                <p className={styles.cardDesc}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* spacing to mimic mobile bottom nav gap */}
            <div style={{ height: 80 }} />

            <Navbar />
        </div>
    );
}
