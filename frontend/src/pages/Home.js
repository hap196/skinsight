import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/predict');
  };
  
  const handleLogin = () => {
    window.location.href = "http://localhost:5001/login";
  };

  return (
    <div className="home">
      <h1>Skinsight</h1>
      <p>Achieving healthy, beautiful skin</p>
      <button onClick={handleLogin}>Login with Google</button>
      <button onClick={handleGetStarted}>Get started</button>
    </div>
  );
};

export default Home;
