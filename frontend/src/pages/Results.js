import React, { useState, useEffect, useRef } from "react";
import "./Results.css";
import Daytime from "./components/Daytime";
import Nighttime from "./components/Nighttime";
import { useLocation } from "react-router-dom";
import star1 from "../assets/star.svg";
import star2 from "../assets/star2.svg";
import star3 from "../assets/star3.svg";
import star4 from "../assets/star4.svg";
import star5 from "../assets/star5.svg";
import star6 from "../assets/star6.svg";
import axios from "axios";
import Chat from "./components/Chat";
import { Button } from "antd";
import vinyl from "../assets/vinyl.png";
import player from "../assets/player.png";
import needle from "../assets/ting.png";

const Results = () => {
  const location = useLocation();
  const { prediction, gptResponse: gptResponseRaw, audio_url } = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [gptResponse, setGptResponse] = useState({});
  const [userName, setUserName] = useState("Guest");
  const [isSpinning, setIsSpinning] = useState(false);
  const audioRef = useRef(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (audio_url) {
      const audioInstance = new Audio(audio_url);
      setAudio(audioInstance);
      audioRef.current = audioInstance;

      return () => {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      };
    }
  }, [audio_url]);

  const handleVinylClick = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setIsSpinning(!isSpinning);
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const hasInitializedRef = useRef(false);
    const [assistantId, setAssistantId] = useState(null);
    const [messages, setMessages] = useState(() => {
      const savedMessages = sessionStorage.getItem("messages");
      return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [threadId, setThreadId] = useState(() => {
      const savedThread = sessionStorage.getItem("threadId");
      return savedThread ? JSON.parse(savedThread) : "";
    });

  useEffect(() => {
    if (!hasInitializedRef.current) {
      initChatBot();
      hasInitializedRef.current = true;
    }
    if (messages.length === 0) {
      setMessages([
        {
          content:
            "Hi, I am the SkInsight AI assistant! I can answer questions about your skincare recommendations and other dermatology questions you have. How may I help you?",
          isUser: false,
        },
        {
          content: "Tell me more about my skincare recommendations",
          isUser: false,
          isSuggested: true,
        },
      ]);
    }
  }, []);

  const fetchAssistant = async () => {
    try {
      const response = await axios.post("http://localhost:5002/get_assistant", {
        context: `Here is the user's information. Skin condition: acne and rosacea. Skincare recommended: salycilic acid`,
        threadId: "",
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching assistant:", error);
    }
  };  

  const initChatBot = async () => {
    const data = await fetchAssistant();
    console.log("Assistant initiated");
    setAssistantId(data?.assistant_id || null);
    setThreadId(data?.threadId || null);
  };

  useEffect(() => {
    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("threadId", JSON.stringify(threadId));
  }, [threadId]);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

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

  // Initialize the audio object when audio_url is available
  useEffect(() => {
    if (audio_url) {
      const audioInstance = new Audio(audio_url);
      setAudio(audioInstance);

      return () => {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      };
    }
  }, [audio_url]);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get("http://localhost:5001/profile");
        setUserName(response.data.name || "Guest");
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserName();
  }, []);

  const ingredients = gptResponse?.ingredients || {};
  // filter out empty steps
  const morning = gptResponse?.morning?.split(".").filter((step) => step.trim() !== "") || [];
  const night = gptResponse?.night?.split(".").filter((step) => step.trim() !== "") || [];

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
    { src: star1, left: "5%", top: "20%" },
    { src: star5, left: "20%", top: "70%" },
    { src: star6, left: "50%", top: "5%" },
    { src: star3, left: "70%", top: "55%" },
    { src: star2, left: "90%", top: "20%" },
    { src: star6, left: "110%", top: "70%" },
    { src: star1, left: "120%", top: "0%" },
    { src: star4, left: "140%", top: "20%" },
    { src: star5, left: "185%", top: "50%" },
    { src: star3, left: "170%", top: "10%" },
    { src: star2, left: "160%", top: "80%" },
  ];

  return (
    <div className="container">

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

      <section className="section product-recommendations">
        <h3 className="greeting">hi, {userName.toLowerCase()}!</h3>
        <h4>your skin is showing signs of: {prediction.toLowerCase()}</h4>
        <br />
        <br />
        <h3>here are your dermatology recommendations:</h3>
        <ul className="ingredients-list">
          {Object.entries(ingredients).map(([ingredient, description], index) => (
            <li className="ingredient-item" key={index}>
              <div className="ingredient-content">
                <div className="ingredient-front">{ingredient}</div>
                <div className="ingredient-back">{description}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="section routines">
        <div className="daytime-container">
          <h3>Morning Routine</h3>
          <ol>
            {morning.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="nighttime-container">
          <h3>Night Routine</h3>
          <ol>
            {night.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audio Player positioned at the bottom right
      {audio_url && (
        <div className="audio-player-container">
          <audio id="background-audio" controls autoPlay loop>
            <source src={audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )} */}

      <div className="chat-launcher">
        <Button className="brown-button" onClick={handleChatToggle}>
          Talk to your dermatology assistant
        </Button>
      </div>

      <div className="chatbox-container">
      {isChatOpen && (
        <div>
          <Chat
            handleClose={handleChatToggle}
            assistantId={assistantId}
            messages={messages}
            setMessages={setMessages}
            threadId={threadId}
            setThreadId={setThreadId}
          />
        </div>
      )}
      </div>
      {/* Vinyl Player */}
      <div className="vinyl-player">
        <img
          src={player}
          alt="Vinyl Player"
          className="vinyl-base"
        />
        <img
          src={vinyl}
          alt="Vinyl Record"
          className={`vinyl-record ${isSpinning ? 'spinning' : ''}`}
          onClick={handleVinylClick}
        />
        <img
          src={needle}
          alt="Vinyl Needle"
          className="vinyl-needle"
        />
      </div>
    </div>
  );
};

export default Results;
