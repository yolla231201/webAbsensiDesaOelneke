import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
  BsHouseDoor,
  BsHouseDoorFill,
  BsClipboard2Check,
  BsClipboard2CheckFill,
  BsClock,
  BsClockFill,
  BsMegaphone,
  BsMegaphoneFill,
} from "react-icons/bs";

const Navbar = () => {
  const location = useLocation(); // untuk membaca route saat ini
  const navigate = useNavigate(); // untuk pindah route
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const menuItems = [
    { icon: <BsHouseDoor />, iconFill: <BsHouseDoorFill />, title: "Home", path: "/dashboard" },
    { icon: <BsClipboard2Check />, iconFill: <BsClipboard2CheckFill />, title: "Tasks", path: "/absen-harian" },
    { icon: <BsClock />, iconFill: <BsClockFill />, title: "History", path: "/riwayat-absen" },
    { icon: <BsMegaphone />, iconFill: <BsMegaphoneFill />, title: "Announcements", path: "/pengumuman" },
  ];

  return (
    <aside className="dashboard-sidebar">
      <nav className="dashboard-nav">
        <ul>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredIndex === index;

            return (
              <li
                key={index}
                title={item.title}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isActive || isHovered ? item.iconFill : item.icon}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Navbar;
