import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Quiz from "./components/Quiz";
import Profile from "./pages/components/Profile";
import Results from "./pages/Results";
import Music from "./components/Music";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/results" element={<Results />} />
          <Route path="/music" element={<Music />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
