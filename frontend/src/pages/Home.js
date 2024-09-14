import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/predict');
  };

  return (
    <div className="home">
      <h1>Skinsight</h1>
      <p>Achieving healthy, beautiful skin</p>
      <button onClick={handleGetStarted}>Get started</button>
    </div>
  );
};

export default Home;