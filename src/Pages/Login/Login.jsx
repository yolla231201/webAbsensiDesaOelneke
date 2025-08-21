import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/style.css";
import "./Login.css";
import Logo from "../../assets/dinas_ttu.png";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 untuk toggle mata
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      showToast(err.message || "Login gagal. Cek email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left side */}
        <div className="login-left">
          <img src={Logo} alt="Logo" className="login-logo" />
          <h1 className="login-left-title">Pemerintah Desa Oelneke</h1>
          <img
            src="https://storage.googleapis.com/a1aa/image/03a2d57d-4756-44a0-dc91-8cad9a8196ac.jpg"
            alt=""
            className="left-bg"
          />
        </div>

        {/* Right side */}
        <div className="login-right">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">
            Selamat Datang! Silahkan masuk dengan akun anda.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Email</label>
              <input
                id="username"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password dengan toggle mata */}
            <div className="input-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <div className="flex-between">
              <button type="button" className="forgot-password">
                Lupa Password?
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <p className="signup-text">
            Belum punya akun?{" "}
            <button
              className="signup-btn-link"
              onClick={() => navigate("/signup")}
            >
              Daftar
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
            background: "#f56565",
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

export default LoginPage;
