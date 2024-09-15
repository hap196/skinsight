import React from "react";
import "./Daytime.css";

const Daytime = ({ products }) => {
  return (
    <div className="routine-container daytime">
      <div className="routine-text-daytime">
        <h3>daytime routine</h3>
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
