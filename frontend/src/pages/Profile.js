import React, { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";
import axios from "axios";

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem("messages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [threadId, setThreadId] = useState(() => {
    const savedThread = sessionStorage.getItem("threadId");
    return savedThread ? JSON.parse(savedThread) : "";
  });
  const hasInitializedRef = useRef(false);

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
          content: "suggested question",
          isUser: false,
          isSuggested: true,
        },
      ]);
    }
  }, []);

  const fetchAssistant = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get_assistant");
      return response.data;
    } catch (error) {
      console.error("Error fetching assistant:", error);
    }
  };

  const initChatBot = async () => {
    const data = await fetchAssistant();
    console.log("Assistant initiated");
    setAssistantId(data.assistant_id);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("threadId", JSON.stringify(threadId));
  }, [threadId]);

  return (
    <div className="app-container">
      <div className="profile-sidebar">
        <h2>Profile</h2>
        <p>
          <strong>Name:</strong> User's Name
        </p>
        <p>
          <strong>Skin Type:</strong> User's Skin Type
        </p>
        <p>
          <strong>Skin Conditions:</strong> User's Conditions
        </p>
        <p>
          <strong>Skin Concerns:</strong> User's Concerns
        </p>
        <div className="chat-launcher">
          <button onClick={handleChatToggle}>
            Talk to our dermatology assistant
          </button>
        </div>
      </div>
      {isChatOpen && (
        <Chat
          handleClose={handleChatToggle}
          assistantId={assistantId}
          messages={messages}
          setMessages={setMessages}
          threadId={threadId}
          setThreadId={setThreadId}
        />
      )}
    </div>
  );
};

export default App;
