import React, { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";
import axios from "axios";
import './Profile.css';
import { Button, Typography, Layout, Space } from "antd";
import { UpOutlined, LeftOutlined, EditOutlined } from '@ant-design/icons'; // Import Edit icon

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const Profile = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State to control sidebar collapse
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
  const question_labels = ["What are your skin concerns?", "Do you have sensitive skin?", "Where is your main concern?"]
  const [userAttributes, setUserAttributes] = useState(
    question_labels.reduce((acc, label) => {
      acc[label] = null;
      return acc;
    }, {}));
  const hasInitializedRef = useRef(false);

  // send cookies with requests
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
        // redirect to login page if not logged in
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
    <Layout className="app-container" style={{ height: '100vh', backgroundColor: '#F3E4C7' }}>
      {/* Collapsed arrow */}
      {isCollapsed && (
        <Button
          type="text"
          onClick={toggleCollapse}
          style={{
            position: 'absolute',
            top: '50px',
            left: '0px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'black',
            display: 'flex',
            alignItems: 'center',
            transform: 'rotate(90deg)',
            zIndex: 1000,
          }}
        >
          <UpOutlined style={{ marginRight: '5px' }} />
          View Profile
        </Button>
      )}

      <Sider
        width={300}
        className="profile-sidebar"
        collapsible
        collapsed={isCollapsed}
        collapsedWidth={0}
        trigger={null}
        style={{
          backgroundColor: '#F3E4C7',
          color: 'black',
          height: '100vh',
          padding: '20px',
          overflow: 'hidden',
          transition: 'transform 0.3s ease',
          transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Replace static text with the user's name */}
          <Title level={3} style={{ color: 'black' }}>{userName}'s Profile</Title>
          <Button
            type="text"
            icon={isCollapsed ? <UpOutlined /> : <LeftOutlined />}
            shape="circle"
            onClick={toggleCollapse}
            style={{
              color: 'black',
              fontSize: '16px',
              borderRadius: '50%',
              border: 'none',
              color: 'black'
            }}
          />
        </div>
        <Space direction="vertical">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ color: 'black', marginRight: '10px' }}>
              <strong>Skin Conditions:</strong>
            </Text>
            <Button
              type="text"
              style={{ color: 'black' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Text style={{ color: 'black', marginRight: '10px' }}>
              TODO: skin conditions
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ color: 'black', marginRight: '10px' }}>
              <strong>Skin Type:</strong>
            </Text>
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: 'black' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Text style={{ color: 'black', marginRight: '10px' }}>
              {userAttributes["What is your skin type?"] || "No skin type inputted."}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ color: 'black', marginRight: '10px' }}>
              <strong>Skin Concerns:</strong>
            </Text>
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: 'black' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Text style={{ color: 'black', marginRight: '10px' }}>
              {userAttributes["What are your skin concerns?"]  || "No skin concerns inputted."}
            </Text>
          </div>
        </Space>
        <div className="chat-launcher" style={{ marginTop: "20px", textAlign: 'center' }}>
        <Button className="brown-button" onClick={handleChatToggle}>
            Talk to our dermatology assistant
        </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: '20px' }}>
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
