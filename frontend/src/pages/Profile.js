import React, { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";
import axios from "axios";
import "./Profile.css";
import { Button, Typography, Space } from "antd";

const { Title, Text } = Typography;

const Profile = ({
  identifiedSkinCondition,
  skinConcerns,
  isCollapsed,
  toggleCollapse,
}) => {
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
  const [userName, setUserName] = useState("Guest");

  const question_labels = [
    "What are your skin concerns?",
    "Do you have sensitive skin?",
    "Where is your main concern?",
  ];
  const [userAttributes, setUserAttributes] = useState(
    question_labels.reduce((acc, label) => {
      acc[label] = null;
      return acc;
    }, {})
  );
  const hasInitializedRef = useRef(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (!hasInitializedRef.current) {
      initChatBot();
      fetchUserAttributes();
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

  const fetchUserAttributes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/profile");
      if (response.data.name) {
        setUserName(response.data.name);
      } else {
        setUserName("Guest");
      }
      if (response.data.quiz_attributes) {
        setUserAttributes(response.data.quiz_attributes);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = "http://localhost:5001/login";
      }
    }
  };

  const fetchAssistant = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get_assistant", {
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

  return (
    <div>
    <div className={`profile-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="profile-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} className="profile-sidebar-title">
            {userName}'s Profile
          </Title>
        </div>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div className="profile-section">
            <Text className="profile-label">
              <strong>Skin Conditions:</strong>
            </Text>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <Text style={{ color: "black" }}>
              {identifiedSkinCondition || "No skin condition identified."}
            </Text>
          </div>
          <div className="profile-section">
            <Text className="profile-label">
              <strong>Skin Concerns:</strong>
            </Text>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <Text style={{ color: "black" }}>
              {skinConcerns || "No skin concerns inputted."}
            </Text>
          </div>
        </Space>
        <div className="chat-launcher">
          <Button
            className="brown-button"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            Talk to our dermatology assistant
          </Button>
        </div>
      </div>
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
    </div>
  );
};

export default Profile;
