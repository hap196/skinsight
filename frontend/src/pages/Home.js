import React, { useEffect } from "react";
import "./Home.css"; // Import the CSS file

const Home = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:5001/login";
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth", // Smooth scrolling
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    // animate objects sequentially
    const fadeInElements = document.querySelectorAll(".fade-in");
    const slideUpElements = document.querySelectorAll(".slide-up");

    fadeInElements.forEach((el) => observer.observe(el));
    slideUpElements.forEach((el) => observer.observe(el));

    return () => {
      fadeInElements.forEach((el) => observer.unobserve(el));
      slideUpElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="home">
      <section className="section1">
        <h1>
          sk<span className="highlight">insight</span>
        </h1>
        <p className="subtitle">ACHIEVING HEALTHY, CONFIDENT SKIN</p>
        <button className="get-started-button" onClick={scrollToBottom}>
          GET STARTED
        </button>
      </section>

      <section className="section2">
        <h2 className="slide-up">no brands, just ingredients.</h2>
        <p className="fade-in">
          Just 7 companies control almost all the beauty products you buy. From
          2009 until now, 595 cosmetics manufacturers have reported using 88
          chemicals, in more than 73,000 products, that have been linked to
          cancer, birth defects or reproductive harm. However, with popular
          culture and social media, it becomes hard to see past the brands. At
          Skinsight, we will help you look for what matters: the ingredients.
        </p>
      </section>

      <section className="section3">
        <h2 class="slide-up">skincare recommendations</h2>
        <h4 class="slide-up">powered with AI</h4>
        <p class="fade-in">
          Our personalized dermatology assistant identifies your skin conditions
          in real time. Simply complete a quiz and upload a photo of your skin
          to receive personalized skincare recommendations. AND personalized
          music to accompany your skincare routine!
        </p>
        <button className="questionare" onClick={handleLogin}>COMPLETE QUESTIONNAIRE</button>
      </section>

      <section className="section4">
        <p>Made with love by the Skinsight team.</p>
      </section>
    </div>
  );
};

export default Home;
