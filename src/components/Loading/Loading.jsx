import React from "react";
import "./Loading.css"; // import file CSS terpisah

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;
