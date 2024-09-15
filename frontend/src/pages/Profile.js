import React, { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";
import axios from "axios";
import "./Profile.css";
import { Button, Typography, Layout, Space } from "antd";
import { UpOutlined, LeftOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const Profile = ({ identifiedSkinCondition, skinConcerns }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      // fetch user attributes
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

  // fetch the user's attributes from the backend
  const fetchUserAttributes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/profile");
      if (response.data.name) {
        setUserName(response.data.name);
      } else {
        console.log("User is not logged in:", response.data.error);
        setUserName("Guest");
      }
      if (response.data.quiz_attributes) {
        setUserAttributes(response.data.quiz_attributes);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("User not logged in:", error.response.data);
        window.location.href = "http://localhost:5001/login";
      } else {
        console.error("Error fetching user attributes:", error.message);
      }
    }
  };

  const fetchAssistant = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get_assistant");
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

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("threadId", JSON.stringify(threadId));
  }, [threadId]);


  return (
    <Layout className="app-container">
      {isCollapsed && (
        <Button
          type="text"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapsed-button"
        >
          <UpOutlined style={{ marginRight: "5px" }} />
          View Profile
        </Button>
      )}

      <Sider
        width={300}
        className={`profile-sidebar ${isCollapsed ? "collapsed" : ""}`}
        collapsible
        collapsed={isCollapsed}
        collapsedWidth={0}
        trigger={null}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={3} className="profile-sidebar-title">
            {userName}'s Profile
          </Title>
          <Button
            type="text"
            icon={isCollapsed ? <UpOutlined /> : <LeftOutlined />}
            shape="circle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="edit-button"
          />
        </div>
        <Space direction="vertical">
          <div className="profile-section">
            <Text className="profile-label">
              <strong>Skin Conditions:</strong>
            </Text>
            <Button type="text" className="edit-button" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <Text style={{ color: "black", marginRight: "10px" }}>
              {identifiedSkinCondition || "No skin condition identified."}
            </Text>
          </div>
          <div className="profile-section">
            <Text className="profile-label">
              <strong>Skin Concerns:</strong>
            </Text>
            <Button type="text" className="edit-button" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <Text style={{ color: "black", marginRight: "10px" }}>
              {skinConcerns || "No skin concerns inputted."}
            </Text>
          </div>
        </Space>
        <div className="chat-launcher">
          <Button className="brown-button" onClick={() => setIsChatOpen(!isChatOpen)}>
            Talk to our dermatology assistant
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: "20px" }}>
          {isChatOpen && (
            <Chat
              handleClose={() => setIsChatOpen(false)}
              assistantId={assistantId}
              messages={messages}
              setMessages={setMessages}
              threadId={threadId}
              setThreadId={setThreadId}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;