import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';  // Import the CSS file

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/quiz');
  };

  return (
    <div className="home">
      <section className="section1">
        <h1 style={{ marginBottom: '0px' }}>
          sk<span className="highlight">insight</span>
        </h1>
        <p>ACHIEVING HEALTHY, BEAUTIFUL SKIN</p>
        <button className="get-started-button" onClick={handleGetStarted}>GET STARTED</button>
      </section>
      <section className="section2">
        <h2>Section 2 Header</h2>
        <p>This is some text in section 2.</p>
      </section>
      <section className="section3">
        <h2>Section 3 Header</h2>
        <img src="/assets/image.jpg" alt="Image Description" />
        <button onClick={handleGetStarted}>Get started</button>
      </section>
    </div>
  );
};

export default Home;
