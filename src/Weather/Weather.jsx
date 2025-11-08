import React from "react";
import styles from "./Weather.module.css";
import { IoLocationSharp } from "react-icons/io5";
import { FiSun } from "react-icons/fi";
import { WiHumidity } from "react-icons/wi";
import { GiWindSlap } from "react-icons/gi";
import Navbar from "../nav/Navbar";

import sunny from "../assets/weather/sunny.png";


export default function Weather() {
    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Weather Reports</h2>

            {/* Top card */}
            <div className={styles.topCard}>
                <div className={styles.locationRow}>
                    <div className={styles.locationBadge}>
                        <IoLocationSharp className={styles.locIcon} />
                        <span>Chennai, Tamilnadu</span>
                    </div>
                </div>

                <div className={styles.topContent}>
                    <div className={styles.tempBlock}>
                        <div className={styles.tempValue}>28° C</div>
                        <div className={styles.date}>31 Oct 2025 | 12.35 pm</div>

                        <div className={styles.smallBadge}>
                            <FiSun className={styles.smallSun} />
                            <span>Sunny</span>
                        </div>
                    </div>

                    <div className={styles.sunArt} aria-hidden>
                        {/* stylized sun — emoji for fidelity to image */}
                        <div className={styles.sunEmoji}>
                            <img src={sunny} alt="sunny" style={{ width: "100%", height: "100%" }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* two metric cards */}
            <div className={styles.metricsRow}>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Precipitation</div>
                    <div className={styles.metricValue}>
                        <WiHumidity className={styles.metricIcon} />
                        <span>5.1 ml</span>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>Wind</div>
                    <div className={styles.metricValue}>
                        <GiWindSlap className={styles.metricIcon} />
                        <span>23 m/s</span>
                    </div>
                </div>
            </div>

            {/* day pills */}
            <div className={styles.dayPills}>
                {[1, 2, 3, 4, 5, 6, 7].map((d, i) => (
                    <div
                        key={d}
                        className={`${styles.pill} ${i === 0 ? styles.activePill : ""}`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* day card */}
            <div className={styles.dayCard}>
                <h3 className={styles.dayTitle}>Monday</h3>
                <p className={styles.dayText}>
                    Today, weather is not good so we need to focus on this and there is
                    possibility of rain.
                </p>
            </div>

            {/* recommendation */}
            <div className={styles.recoCard}>
                <div className={styles.recoHeader}>
                    <span className={styles.greenPill}>Recommendations</span>
                </div>

                <div className={styles.recoBody}>
                    <div className={styles.recoRow}>
                        <div><strong>Crop: </strong><span className={styles.crop}>Paddy</span></div>
                    </div>

                    <div className={styles.recoRow}>
                        <div>
                            <strong>Current weather: </strong>
                            <span className={styles.weatherHighlight}>Sunny (28° C)</span>
                        </div>
                    </div>

                    <div className={styles.alertBox}>
                        <p>
                            High heat dries paddy quickly; irrigate early morning or evening
                            to prevent crop stress.
                        </p>
                    </div>
                </div>
            </div>

            {/* bottom spacing to match image */}
            <div style={{ height: 36 }} />
            <Navbar />
        </div>
    );
}
