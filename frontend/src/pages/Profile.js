import React, { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";
import axios from "axios";
import { Button, Typography, Layout, Space } from "antd";

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const Profile = () => {
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
    <Layout className="app-container">
      <Sider width={300} className="profile-sidebar">
        <Title level={2}>Profile</Title>
        <Space direction="vertical">
          <Text>
            <strong>Name:</strong> User's Name
          </Text>
          <Text>
            <strong>Skin Type:</strong> User's Skin Type
          </Text>
          <Text>
            <strong>Skin Conditions:</strong> User's Conditions
          </Text>
          <Text>
            <strong>Skin Concerns:</strong> User's Concerns
          </Text>
        </Space>
        <div className="chat-launcher" style={{ marginTop: "20px" }}>
          <Button type="primary" onClick={handleChatToggle}>
            Talk to our dermatology assistant
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content>
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