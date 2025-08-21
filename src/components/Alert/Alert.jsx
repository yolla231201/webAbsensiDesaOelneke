import React, { useEffect, useState } from "react";
import "./Alert.css";

const Alert = ({ message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true); // show dulu
      const timer = setTimeout(() => {
        setVisible(false); // mulai fade-out
        setTimeout(() => {
          if (onClose) onClose(); // bener2 hilang setelah animasi
        }, 500); // waktu animasi fadeOut
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`alert-container ${visible ? "fade-in" : "fade-out"}`}>
      <div className="alert-warning">
        {message}
      </div>
    </div>
  );
};

export default Alert;
