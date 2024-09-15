import React from 'react';
import './Home.css';  // Import the CSS file

const Home = () => {
  
  const handleLogin = () => {
    window.location.href = "http://localhost:5001/login";
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth' // Smooth scrolling
    });
  };

  return (
    <div className="home">
      <section className="section1">
        <h1>
          sk<span className="highlight">insight</span>
        </h1>
        <p>ACHIEVING HEALTHY, BEAUTIFUL SKIN</p>
        <button className="get-started-button" onClick={scrollToBottom}>GET STARTED</button>
      </section>
      <section className="section2">
        <h2>skincare recommendations</h2>
        <h4>powered with AI</h4>
        <p>We use an AI model trained on dermatology datasets to identify your skin conditions in real time.
          Simply complete a quiz and upload a photo of your skin to receive personalized skincare recommendations.
        </p>
      </section>
      <section className="section3">
        <h2>no brands, just ingredients.</h2>
        <p>
          Just 7 companies control almost all the beauty products you buy. Given the concentration of the fashion market, it becomes hard to see past the brands. At Skinsight, we will help you look for what matters: the ingredients.
        </p>
        <button onClick={handleLogin}>TAKE QUIZ</button>
      </section>
    </div>
  );
};

export default Home;
