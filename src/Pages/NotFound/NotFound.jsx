import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NotFound.css";

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-message">Halaman tidak ditemukan</p>
      {user ? (
        <Link to="/dashboard" className="notfound-link">
          Kembali ke Dashboard
        </Link>
      ) : (
        <Link to="/login" className="notfound-link">
          Pergi ke Login
        </Link>
      )}
    </div>
  );
};

export default NotFound;
