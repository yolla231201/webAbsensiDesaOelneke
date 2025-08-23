import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/style.css";
import "./Login.css";
import Logo from "../../assets/dinas_ttu.png";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import Loading from "../../components/Loading/Loading";

const LoginPage = () => {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const { data, error } = await login(email, password);
      if (error) throw error;
      if (!data?.profile) {
        throw new Error("Akun ini belum terdaftar di sistem desa. Hubungi Kepala Desa.");
      }

      const fullUser = { ...data.user, ...data.profile };
      setUser(fullUser);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Login gagal. Cek email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left">
          <img src={Logo} alt="Logo" className="login-logo" />
          <h1 className="login-left-title">Pemerintah Desa Oelneke</h1>
        </div>

        <div className="login-right">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">
            Selamat Datang! Silahkan masuk dengan akun anda.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <Loading /> : "Login"}
            </button>
          </form>

          {toast && <div className="toast">{toast}</div>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
