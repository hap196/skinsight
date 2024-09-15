import React, { useEffect } from "react";
import "./Results.css";
import Daytime from "./components/Daytime";
import Nighttime from "./components/Nighttime";
import { useLocation } from "react-router-dom";

const Results = () => {
  // Get the passed prediction and recommendations from location state
  const location = useLocation();
  let { prediction, gptResponse } = location.state || {}; // Fallback to empty if no state is passed

  if (typeof gptResponse === "string") {
    try {
      gptResponse = JSON.parse(gptResponse); // Parse the string as JSON
    } catch (error) {
      console.error("Failed to parse GPT response:", error);
      gptResponse = {}; // Fallback to an empty object if parsing fails
    }
  }

  // Parse the GPT response JSON for product recommendations and routines
  const ingredients = gptResponse?.ingredients || [];
  const ingredientDescriptions = gptResponse?.ingredient_descriptions || {};
  const morning = gptResponse?.morning || "";
  const night = gptResponse?.night || "";

  const ingredientList = ingredients.map((ingredient) => ({
    ingredient,
    description: ingredientDescriptions[ingredient] || "No description available",
  }));

  useEffect(() => {
    // Smooth scrolling function
    function smoothScroll(target, duration) {
      let start = window.pageXOffset; // Start position is the current horizontal scroll
      let distance = target - start;
      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        let timeElapsed = currentTime - startTime;
        let run = ease(timeElapsed, start, distance, duration);
        window.scrollTo(run, window.pageYOffset); // Horizontal scrolling while retaining the vertical position
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }

    // Scroll arrow functionality
    const scrollArrow = document.querySelector(".scroll-arrow");
    if (scrollArrow) {
      scrollArrow.addEventListener("click", () => {
        const currentScroll = window.pageXOffset;
        const pageWidth = window.innerWidth;
        const totalWidth = document.querySelector(".container").scrollWidth;

        if (currentScroll + pageWidth >= totalWidth) {
          smoothScroll(0, 1000); // Scroll back to start
        } else {
          smoothScroll(currentScroll + pageWidth, 1000); // Scroll to the next section
        }
      });
    }

    // Create floating elements (Bubbles, sparkles, sun, and moon) - limited number of emojis
    const floatingElements = [
      { emoji: "🌞", size: "40px" },
      { emoji: "✨", size: "30px" },
      { emoji: "🌙", size: "50px" },
      { emoji: "🫧", size: "40px" },
      { emoji: "✨", size: "60px" },
    ];

    floatingElements.forEach((element) => {
      const floatingEl = document.createElement("div");
      floatingEl.className = "floating-element";
      floatingEl.style.fontSize = element.size;
      floatingEl.textContent = element.emoji;
      floatingEl.style.left = `${Math.random() * 200}vw`; // Adjusted to limit the spread
      floatingEl.style.top = `${Math.random() * 100}vh`;
      document.body.appendChild(floatingEl);
    });

    // Horizontal scroll handler
    const handleScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        window.scrollBy(e.deltaY, 0); // Horizontal scroll
        animateEmojis(); // Animate emojis slightly when scrolling
      }
    };

    const animateEmojis = () => {
      const floatingEls = document.querySelectorAll(".floating-element");
      floatingEls.forEach((el) => {
        const randomX = Math.random() * 20 - 10; // Slight movement
        const randomY = Math.random() * 10 - 5;
        el.style.transform = `translate(${randomX}px, ${randomY}px)`;
      });
    };

    window.addEventListener("wheel", handleScroll, { passive: false });

    // Update background gradient on scroll
    const handleGradientUpdate = () => {
      const scrollPercentage =
        window.pageXOffset /
        (document.documentElement.scrollWidth - window.innerWidth);
      const beigeToBlue = `linear-gradient(135deg, 
                hsl(${40 + scrollPercentage * 80}, 70%, 90%), 
                hsl(${200 - scrollPercentage * 100}, 100%, 85%))`;
      const blueToNight = `linear-gradient(135deg, 
                hsl(${200 - scrollPercentage * 100}, 85%, 85%), 
                hsl(${270 - scrollPercentage * 70}, 60%, 30%))`;

      document.body.style.background =
        scrollPercentage < 0.5 ? beigeToBlue : blueToNight;
    };

    window.addEventListener("scroll", handleGradientUpdate);

    // Cleanup event listeners when component unmounts
    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("scroll", handleGradientUpdate);
    };
  }, []);

  return (
    <div className="container">
      <section className="section product-recommendations">
        <h2>Identified Skin Concerns</h2>
        <p>{prediction || "No skin concerns identified."}</p>
      </section>
      
      {/* Product Recommendations Section */}
      <section className="section product-recommendations">
        <h2>Product Recommendations</h2>
        {ingredients.length > 0 ? (
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                <strong>{ingredient}:</strong> {ingredientDescriptions[ingredient]}
              </li>
            ))}
          </ul>
        ) : (
          <p>No product recommendations available.</p>
        )}
      </section>

      {/* Routines Section */}
      <section className="section routines">
        <Daytime products={morning.split('.')} />
        <Nighttime products={night.split('.')} />
      </section>

      <button className="scroll-arrow">&#8594;</button>
    </div>
  );
};

export default Results;
