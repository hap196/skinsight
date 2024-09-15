import React from "react";
import "./Nighttime.css";

const Nighttime = ({ products }) => {
  return (
    <div className="routine-container nighttime">
      <div className="routine-image-nighttime">
        <img src="/nighttime.png" alt="Nighttime Routine" />
      </div>
      <div className="routine-text-nighttime">
        <h2>Nighttime Routine</h2>
        <ul>
          {products.length > 0 ? (
            products.map((product, index) => (
              <li key={index}>{product.trim()}</li>
            ))
          ) : (
            <p>No nighttime routine provided.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Nighttime;
