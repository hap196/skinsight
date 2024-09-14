// Daytime.js
import React from "react";
import "./Daytime.css";

const Daytime = () => {
  return (
    <div className="routine-container daytime">
      <div className="routine-image-daytime">
        <img src="/daytime.png" alt="Daytime Routine" />
      </div>
      <div className="routine-text-daytime">
        <h2>Daytime Routine</h2>
        <ul>
          <li>Facial wash</li>
          <li>Toner</li>
          <li>Moisturizer</li>
          <li>SPF</li>
        </ul>
      </div>
    </div>
  );
};

export default Daytime;
