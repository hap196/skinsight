// Nighttime.js
import React from "react";
import "./Nighttime.css";

const Nighttime = () => {
  return (
    <div className="routine-container nighttime">
      <div className="routine-image-nighttime">
        <img src="/nighttime.png" alt="Nighttime Routine" />
      </div>
      <div className="routine-text-nighttime">
        <h2>Nighttime Routine</h2>
        <ul>
          <li>Facial wash</li>
          <li>Toner</li>
          <li>Serum</li>
          <li>Moisturizer</li>
        </ul>
      </div>
    </div>
  );
};

export default Nighttime;
