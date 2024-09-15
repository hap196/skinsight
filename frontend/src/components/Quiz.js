import React, { useState } from "react";
import axios from "axios";
import { Row, Col, message, Carousel, Steps, Upload, Button } from "antd";
import { CheckCircleOutlined, FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";

const handleLogin = () => {
  window.location.href = "http://localhost:5001/login";
};

const SkinAIForm = () => {
  const [formData, setFormData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const carouselRef = React.useRef();

  const stepsData = [
    { title: "Login" },
    { title: "Questions" },
    { title: "Upload Image" },
  ];

  const questions = [
    {
      label: "What best describes your skin type?",
      options: ["Oily", "Combination", "Dry"],
      multiple: false,
      icons: [<FrownOutlined />, <MehOutlined />, <SmileOutlined />],
    },
    {
      label: "What are your skin concerns?",
      options: [
        "Large pores",
        "Wrinkles",
        "Sun spots",
        "Bumpy skin",
        "Sebaceous filaments",
        "Hyperpigmentation",
        "Blackheads",
        "Acne scars",
        "Flaky skin",
      ],
      multiple: true,
    },
    {
      label: "Do you have sensitive skin?",
      options: ["Yes", "No", "I don’t know"],
      icons: [<CheckCircleOutlined />, <FrownOutlined />, <MehOutlined />],
    },
    {
      label: "Where is your main concern?",
      options: [
        "Cheeks",
        "Forehead",
        "Arms/Hands",
        "Leg/Feet",
        "Back",
        "Chest",
        "Neck",
        "Multiple locations",
      ],
    },
  ];

  const handleSelect = (value) => {
    if (questions[currentQuestion].multiple) {
      const prevValues = formData[questions[currentQuestion].label] || [];
      const newValues = prevValues.includes(value)
        ? prevValues.filter((item) => item !== value)
        : [...prevValues, value];
      setFormData({
        ...formData,
        [questions[currentQuestion].label]: newValues,
      });
    } else {
      setFormData({ ...formData, [questions[currentQuestion].label]: value });
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      carouselRef.current?.next();
    } else if (currentStep === 1 && currentQuestion === questions.length - 1) {
      setCurrentStep(2);
    } else if (currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      carouselRef.current?.prev();
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = ({ file, fileList }) => {
    setFileList(fileList);
    setFile(file.originFileObj); // Store the actual file object
    message.success("File uploaded successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    for (const key in formData) {
      formDataToSend.append(key, formData[key]); // Append quiz answers
    }

    try {
      // Post a prediction to the predict endpoint
      const response = await axios.post("http://127.0.0.1:5001/predict", formDataToSend);
      const prediction = response.data.predicted_disease_class;
      const gptResponse = response.data.skincare_recommendations;

      // Post form responses to the profile endpoint
      const response2 = await axios.post("http://127.0.0.1:5001/profile", formDataToSend);

      // Pass predictions to results page then redirect
      navigate("/results", { state: { prediction, gptResponse } });
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-content">
            <h3 className="question-title">Login</h3>
            <div>
              <a className="nav-link" onClick={handleNext}>
                Login
              </a>
              {" | "}
              <a className="nav-link" onClick={handleNext}>
                Skip
              </a>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="form-content">
            <Carousel ref={carouselRef} dots={false} effect="scrollx">
              {questions.map((question, index) => (
                <div key={index}>
                  <h3 className="question-title">{question.label}</h3>
                  <Row gutter={[16, 16]} className="options">
                    {question.options.map((option, idx) => (
                      <Col flex="1 0 20%" key={idx}>
                        <div
                          className={`option-circle ${
                            formData[question.label]?.includes(option) ? "selected" : ""
                          }`}
                          onClick={() => handleSelect(option)}
                        >
                          <p>{option}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Carousel>
            <div className="navigation-buttons">
              <a className="nav-link" onClick={handleBack}>
                Back
              </a>
              <a className="nav-link" onClick={handleNext}>
                Next
              </a>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-content">
            <h3>Upload a clear image of your skin</h3>
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleImageUpload}
              maxCount={1}
            >
              <a className="nav-link">Upload Image</a>
            </Upload>
            <div className="navigation-buttons">
              <a className="nav-link" onClick={handleBack}>
                Back
              </a>
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!file || isLoading}
              >
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="page-title">About You</h2>
      <div className="steps-container">
        <Steps current={currentStep}>
          {stepsData.map((step, index) => (
            <Steps.Step
              key={index}
              title={step.title}
              icon={currentStep > index ? <CheckCircleOutlined /> : undefined}
            />
          ))}
        </Steps>
      </div>
      <div className="form-container">{renderStep()}</div>
    </div>
  );
};

export default SkinAIForm;
