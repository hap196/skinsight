import React from "react";
import "./Daytime.css";

const Daytime = ({ products }) => {
  return (
    <div className="routine-container daytime">
      <div className="routine-image-daytime">
        <img src="/daytime.png" alt="Daytime Routine" />
      </div>
      <div className="routine-text-daytime">
        <h2>Daytime Routine</h2>
        <ul>
          {products.length > 0 ? (
            products.map((product, index) => (
              <li key={index}>{product.trim()}</li>
            ))
          ) : (
            <p>No daytime routine provided.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Daytime;
