import React, { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaCog, FaUserEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RotatingText from "./RotatingText";
import "./ProfileMenu.css";
import userPlaceholder from "../../assets/Logo_Kementerian.png";
import appLogo from "../../assets/dinas_ttu.png";

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-menu">
      {/* Logo + Desa */}
      <div className="app-logo-wrapper">
        <img src={appLogo} alt="Logo App" className="app-logo" />
        <div className="desa-wrapper">
          <span className="desa-static">Desa</span>
          <RotatingText
            texts={["Oelneke", "KB", "Leluhur", "Lestari"]}
            mainClassName="rotating-text-main"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="rotating-text-split"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </div>
      </div>

      {/* Profile */}
      <div className="profile-wrapper" ref={dropdownRef}>
        <img
          src={userPlaceholder}
          alt="User"
          className="profile-photo"
          onClick={() => setIsOpen((prev) => !prev)}
        />

        {isOpen && (
          <div className="profile-dropdown">
            <img src={userPlaceholder} alt="User" className="dropdown-photo" />
            <div className="user-info">
              <p className="user-name">{user?.nama || "Nama User"}</p>
              <p className="user-email">{user?.email || "email@example.com"}</p>
              <p className="user-role">{user?.jabatan || "Jabatan"}</p>
            </div>

            {/* Menu Tambahan */}
            <div className="dropdown-menu">
              {user?.role === "kepala_desa" && (
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/pengaturan");
                    setIsOpen(false);
                  }}
                >
                  <FaCog /> Pengaturan
                </button>
              )}

              <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/edit-profil");
                  setIsOpen(false);
                }}
              >
                <FaUserEdit /> Edit Profil
              </button>

              {/* Tombol Buat Pengumuman untuk kepala desa */}
              {user?.role === "kepala_desa" && (
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/buat-pengumuman");
                    setIsOpen(false);
                  }}
                >
                  📝 Buat Pengumuman
                </button>
              )}
            </div>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileMenu;
