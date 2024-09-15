import React, { useState, useEffect, useRef } from "react";
import { Input, Layout, Button, Typography, Space, Spin } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";
import Message from "./Message";
import { MessageDto } from "./MessageDto";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const Chat = ({
  handleClose,
  assistantId,
  messages,
  setMessages,
  threadId,
  setThreadId,
}) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [input, setInput] = useState("");
  const [shouldSendMessage, setShouldSendMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Send a message and receive the chatbot's response
  const fetchMessage = async (input) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/send_message', { input, threadId });
      setThreadId(response.data.threadId);
      return response.data;
    } catch (error) {
      console.error("Error fetching message response:", error);
    }
  };

  const createNewMessage = (content, isUser, isSuggested = false) => {
    return new MessageDto(isUser, isSuggested, content);
  };

  const handleSendMessage = async () => {
    if (!assistantId) {
      console.warn("Assistant is not initialized yet.");
      return;
    }
    const newMessages = [...messages, createNewMessage(input, true)];
    setMessages(newMessages);
    setInput("");

    setIsWaiting(true);
    const data = await fetchMessage(input);
    setIsWaiting(false);

    // Handle buttons
    if (data.response) {
      setMessages([...newMessages, createNewMessage(data.response, false)]);
    } else {
      console.error("No response from the assistant.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (shouldSendMessage) {
      handleSendMessage();
      setShouldSendMessage(false);
    }
  }, [input]);

  const handleSuggestedMessageClick = (content) => {
    setInput(content);
    setShouldSendMessage(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Layout
      style={{
        position: "fixed",
        bottom: "50px",
        right: "50px",
        width: "350px",
        height: "500px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <Header
        style={{
          backgroundColor: "#68563f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px", // Adjust side padding here
        }}
      >
        <Title level={4} style={{ color: "white", margin: 0 }}>
          SkInsight Assistant
        </Title>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          style={{ color: "white" }}
        />
      </Header>

      <Content style={{ padding: "16px", overflowY: "auto", flexGrow: 1 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message}
              onMessageClick={handleSuggestedMessageClick}
            />
          ))}
          <div ref={messagesEndRef} />
        </Space>
      </Content>

      <Footer style={{ padding: "16px", position: "relative" }}>
        {isWaiting && (
          <Spin
            style={{ position: "absolute", bottom: "100px", left: "10px" }}
            size="small"
          />
        )}
        <Space style={{ width: "100%" }}>
          <TextArea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleKeyPress}
            placeholder="Type your message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ width: "100%" }} // Make textarea span the full width
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            style={{ backgroundColor: "#68563f", borderColor: "#68563f" }}
          />
        </Space>
      </Footer>
    </Layout>
  );
};

export default Chat;
