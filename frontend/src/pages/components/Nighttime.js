import React from "react";
import "./Nighttime.css";

const Nighttime = ({ products }) => {
  return (
    <div className="routine-container nighttime">
      <div className="routine-text-nighttime">
        <h3>nighttime routine</h3>
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
