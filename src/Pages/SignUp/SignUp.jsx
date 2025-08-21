import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/style.css"; // warna & font global
import "./SignUp.css";
import Logo from "../../assets/dinas_ttu.png";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";

const SignUp = () => {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== konfirmasiPassword) {
      showToast("Password dan konfirmasi tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      // 🚀 API SignUp / Firebase register
      console.log("User Registered:", { nama, email, password });
      showToast("Signup berhasil!");
      navigate("/login");
    } catch (err) {
      showToast(err.message || "Signup gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        {/* Left side */}
        <div className="signup-left">
          <img src={Logo} alt="Logo" className="signup-logo" />
          <h1 className="signup-left-title">Pemerintah Desa Oelneke</h1>
          <img
            src="https://storage.googleapis.com/a1aa/image/03a2d57d-4756-44a0-dc91-8cad9a8196ac.jpg"
            alt=""
            className="left-bg"
          />
        </div>

        {/* Right side */}
        <div className="signup-right">
          <h2 className="signup-title">Daftar Akun</h2>
          <p className="signup-subtitle">
            Buat akun baru untuk mengakses sistem desa.
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="nama">Nama Lengkap</label>
              <input
                id="nama"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="input-group password-group">
              <label htmlFor="konfirmasiPassword">Konfirmasi Password</label>
              <div className="password-wrapper">
                <input
                  id="konfirmasiPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <IoIosEyeOff /> : <IoMdEye />}
                </span>
              </div>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          <p className="login-text">
            Sudah punya akun?{" "}
            <button
              className="login-btn-link"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            background: "#38a169",
            color: "#fff",
            padding: "1rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default SignUp;
