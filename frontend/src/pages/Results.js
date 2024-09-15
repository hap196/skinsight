import React, { useEffect, useState } from "react";
import "./Results.css";
import Daytime from "./components/Daytime";
import Nighttime from "./components/Nighttime";
import { useLocation } from "react-router-dom";
import starImg1 from "../assets/star.svg";
import Profile from "./Profile";

const Results = () => {
  const location = useLocation();
  const { prediction, gptResponse: gptResponseRaw, audio_url } = location.state || {}; 

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [gptResponse, setGptResponse] = useState({});

  // Parse GPT response if it's a string
  useEffect(() => {
    if (typeof gptResponseRaw === "string") {
      try {
        setGptResponse(JSON.parse(gptResponseRaw));
      } catch (error) {
        console.error("Failed to parse GPT response:", error);
        setGptResponse({});
      }
    } else {
      setGptResponse(gptResponseRaw || {});
    }
  }, [gptResponseRaw]);

  // initialize the audio object when audio_url is available
  useEffect(() => {
    if (audio_url) {
      const audioInstance = new Audio(audio_url);
      // store audio instance for playback control
      setAudio(audioInstance);

      return () => {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      };
    }
  }, [audio_url]);


  const ingredients = gptResponse?.ingredients || {};
  const morning = gptResponse?.morning || "";
  const night = gptResponse?.night || "";
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const smoothScroll = (target, duration) => {
      let start = window.pageXOffset;
      let distance = target - start;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        let timeElapsed = currentTime - startTime;
        let run = ease(timeElapsed, start, distance, duration);
        window.scrollTo(run, window.pageYOffset);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      };

      const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      requestAnimationFrame(animation);
    };

    const handleScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        window.scrollBy(e.deltaY, 0);
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });

    const handleGradientUpdate = () => {
      const scrollPercentage =
        window.pageXOffset /
        (document.documentElement.scrollWidth - window.innerWidth);
      const beigeToBlue = `linear-gradient(135deg, hsl(${
        40 + scrollPercentage * 80
      }, 70%, 90%), hsl(${200 - scrollPercentage * 100}, 100%, 85%))`;
      const blueToNight = `linear-gradient(135deg, hsl(${
        200 - scrollPercentage * 100
      }, 85%, 85%), hsl(${270 - scrollPercentage * 70}, 60%, 30%))`;

      document.body.style.background =
        scrollPercentage < 0.5 ? beigeToBlue : blueToNight;
    };

    window.addEventListener("scroll", handleGradientUpdate);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("scroll", handleGradientUpdate);
    };
  }, []);

  const starImages = [
    { src: starImg1, left: "5%", top: "20%" },
    { src: starImg1, left: "20%", top: "70%" },
    { src: starImg1, left: "50%", top: "5%" },
    { src: starImg1, left: "70%", top: "55%" },
    { src: starImg1, left: "90%", top: "20%" },
    { src: starImg1, left: "110%", top: "70%" },
    { src: starImg1, left: "120%", top: "0%" },
    { src: starImg1, left: "140%", top: "20%" },
    { src: starImg1, left: "185%", top: "50%" },
    { src: starImg1, left: "170%", top: "10%" },
    { src: starImg1, left: "160%", top: "80%" },
  ];

  return (
    <div className={`container ${isProfileOpen ? "profile-open" : ""}`}>
      <Profile
        identifiedSkinCondition={prediction}
        skinConcerns={gptResponse?.skin_concerns}
        isCollapsed={!isProfileOpen}
        toggleCollapse={toggleProfile}
      />

      <div className="floating-images">
        {starImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={`star-${index}`}
            className="floating-image"
            style={{ left: image.left, top: image.top }}
          />
        ))}
      </div>
      <button onClick={toggleProfile} className="open-profile-button">
        {isProfileOpen ? "Close Profile" : "Open Profile"}
      </button>

      <section className="section product-recommendations">
        <h2>Product Recommendations</h2>
        {Object.keys(ingredients).length > 0 ? (
          <ol>
            {Object.entries(ingredients).map(
              ([ingredient, description], index) => (
                <li key={index}>
                  <strong>{ingredient}</strong>
                  <ul style={{ marginLeft: "20px" }}>
                    <li>{description}</li>
                  </ul>
                </li>
              )
            )}
          </ol>
        ) : (
          <p>No product recommendations available.</p>
        )}
        {/* Audio Player */}
      {audio_url ? (
        <div className="song-controls">
          <h3>Your Generated Song</h3>
          <audio id="background-audio" controls autoPlay loop>
            <source src={audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <p>Sorry, no audio is available yet.</p>
      )}
      </section>

      <section className="section routines">
        <div className="daytime-container">
          <Daytime products={morning.split(".")} />
        </div>
        <div className="nighttime-container">
          <Nighttime products={night.split(".")} />
        </div>
      </section>
    </div>
  );
};

export default Results;
