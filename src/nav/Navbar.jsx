import React from 'react';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

import { FiSun, FiUser, FiHome } from "react-icons/fi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoSparklesOutline } from "react-icons/io5";

const Navbar = () => {
  return (
    <div>
      <nav className={styles.bottomNav}>
        {/* Home */}
        <Link to="/home" className={styles.navBtn}>
          <FiHome size={20} />
          <span>Home</span>
        </Link>

        {/* Chat */}
        <Link to="/chat" className={styles.navBtn}>
          <IoChatboxEllipsesOutline size={20} />
          <span>Chat</span>
        </Link>

        {/* Center Glow (Analysis) */}
        <Link to="/analysis" className={styles.centerAction}>
          <div className={styles.centerGlow}>
            <IoSparklesOutline size={26} />
          </div>
        </Link>

        {/* Weather */}
        <Link to="/weather" className={styles.navBtn}>
          <FiSun size={20} />
          <span>Weather</span>
        </Link>

        {/* Profile */}
        <Link to="/profile" className={styles.navBtn}>
          <FiUser size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
