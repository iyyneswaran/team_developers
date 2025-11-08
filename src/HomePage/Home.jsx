import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for navigation
import styles from "./Home.module.css";
import Navbar from "../nav/Navbar";

// icons
import { IoChatboxEllipsesOutline, IoLocationSharp } from "react-icons/io5";
import { FiBell, FiChevronDown, FiSun } from "react-icons/fi";
import { WiRaindrop, WiStrongWind } from "react-icons/wi";
import { SiSimpleanalytics } from "react-icons/si";
import { MdFormatListNumbered, MdArrowOutward } from "react-icons/md";
import { FaRegClock } from "react-icons/fa";

// images
import bg from "../assets/farm.jpeg";
import avatar from "../assets/avatar/avatar_farm.png";

// weather images
import sunny from "../assets/weather/sunny.png";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
  let deferredPrompt;
  function onBeforeInstallPrompt(e) {
    e.preventDefault();
    deferredPrompt = e;
    // show your install button
  }
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
}, []);

  const carddetails = [
    {
      id: "bot",
      icon: <IoChatboxEllipsesOutline />,
      title: "FreshAir Bot",
      desc: "Chat with our FreshAir bot to get rid of your doubts",
      color: "#113DFE",
      bg: "#DFFAFF",
      route: "/chat",
    },
    {
      id: "ai",
      icon: <SiSimpleanalytics />,
      title: "AI Analysis",
      desc: "Capture the image and make analysis using AI",
      color: "#FE4511",
      bg: "#FFEADF",
      route: "/analysis",
    },
    {
      id: "schemes",
      icon: <MdFormatListNumbered />,
      title: "Schemes",
      desc: "Check out the schemes which matches you",
      color: "#2B127D",
      bg: "#EBE7FF",
      route: "/schemes",
    },
    {
      id: "activities",
      icon: <FaRegClock />,
      title: "Recent Activities",
      desc: "Recent activities which have done by you",
      color: "#02760F",
      bg: "#D9FFDD",
      route: "/activities",
    },
  ];

  // time
  const [timeString, setTimeString] = useState("");
  useEffect(() => {
    function update() {
      const d = new Date();
      const date = d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTimeString(`${date} | ${time}`);
    }
    update();
    const t = setInterval(update, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // language dropdown
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");
  const langRef = useRef(null);
  const languages = [
    { code: "en", label: "English" },
    { code: "ta", label: "தமிழ்" },
    { code: "hi", label: "हिन्दी" },
    { code: "tel", label: "తెలుగు" },
    { code: "mal", label: "മലയാളം" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function onSelectLanguage(lang) {
    setCurrentLang(lang.label);
    setLangOpen(false);
    // TODO: integrate i18n or context if needed
  }

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.topBar}>
        <div className={styles.greeting}>
          <img className={styles.avatar} alt="avatar" src={avatar} />
          <div className={styles.greetText}>
            <div className={styles.small}>Good Morning 👋</div>
            <div className={styles.name}>John Doe</div>
          </div>
        </div>

        <div className={styles.topActions}>
          {/* language dropdown */}
          <div className={styles.langWrapper} ref={langRef}>
            <button
              className={styles.langButton}
              onClick={() => setLangOpen((s) => !s)}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <span className={styles.langLabel}>{currentLang}</span>
              <FiChevronDown className={styles.langChevron} />
            </button>

            {langOpen && (
              <ul className={styles.langMenu} role="listbox">
                {languages.map((l) => (
                  <li
                    key={l.code}
                    role="option"
                    aria-selected={currentLang === l.label}
                    className={styles.langItem}
                    onClick={() => onSelectLanguage(l)}
                  >
                    {l.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className={styles.bell}>
            <FiBell />
          </button>
        </div>
      </div>

      <div className={styles.contentWrap}>
        {/* Weather Card */}
        <div className={styles.weatherCard}>
          <div className={styles.locationBadge}>
            <IoLocationSharp />
            Chennai, Tamilnadu
          </div>

          <div className={styles.weatherMain}>
            <div className={styles.tempLeft}>
              <div className={styles.tempLarge}>
                28<span className={styles.degree}>°C</span>
              </div>
              <div className={styles.timeSmall}>{timeString}</div>
              <div className={styles.conditionBadge}>
                <FiSun style={{ marginRight: 8 }} /> Sunny
              </div>
            </div>

            <div className={styles.sunIcon}>
              <div className={styles.sunShape}>
                <img
                  src={sunny}
                  alt="sunny"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statLeft}`}>
            <div className={styles.statLabel}>Precipitation</div>
            <div className={styles.statValue}>
              <WiRaindrop
                size={28}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              5.1 ml
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statRight}`}>
            <div className={styles.statLabel}>Wind</div>
            <div className={styles.statValue}>
              <WiStrongWind
                size={28}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              23 m/s
            </div>
          </div>
        </div>

        {/* Quick Links (Feature Cards) */}
        <div className={styles.features}>
          {carddetails.map((card) => (
            <div
              className={styles.featureCard}
              key={card.id}
              onClick={() => navigate(card.route)} // ✅ route on click
              style={{ cursor: "pointer" }}
            >
              <div
                className={styles.featureIcon}
                style={{
                  background: card.bg,
                  color: card.color,
                }}
              >
                {React.cloneElement(card.icon, { size: 20 })}
              </div>

              <div className={styles.featureTitle}>{card.title}</div>
              <div className={styles.featureDesc}>{card.desc}</div>

              <div className={styles.circularArrow}>
                <MdArrowOutward />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navbar />
    </div>
  );
}
