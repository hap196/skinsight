import React, { useState } from "react";
import axios from "axios";
import { Row, Col, message, Carousel, Steps, Upload, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";
import dryImg from "../assets/buttons/dry.svg";
import comboImg from "../assets/buttons/combo.svg";
import oilyImg from "../assets/buttons/oily.svg";
import poreImg from "../assets/buttons/pores.svg";
import bumpyImg from "../assets/buttons/bumpy.svg";
import blackheadImg from "../assets/buttons/blackhead.svg";
import hyperImg from "../assets/buttons/hyper.svg";
import scarImg from "../assets/buttons/scar.svg";
import sebumImg from "../assets/buttons/sebum.svg";
import sunImg from "../assets/buttons/sun.svg";
import wrinkleImg from "../assets/buttons/wrinkle.svg";

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
    { title: "Medical" },
    { title: "Lifestyle" },
    { title: "Upload Image" },
  ];

  const medicalQuestions = [
    {
      label: "What best describes your skin type?",
      options: ["DRY", "COMBINATION", "OILY"],
      multiple: false,
      images: [dryImg, comboImg, oilyImg],
    },
    {
      label: "What are your skin concerns?",
      options: [
        "LARGE PORES", "WRINKLES", "SUNSPOTS", "BUMPY SKIN", "SEBACEOUS FILAMENTS",
        "HYPERPIGMENTATION", "BLACKHEADS", "ACNE SCARS", "FLAKY SKIN"
      ],
      images: [
        poreImg, wrinkleImg, sunImg, bumpyImg, sebumImg, hyperImg, blackheadImg, scarImg, dryImg
      ],
      multiple: true,
    },
    {
      label: "Do you have sensitive skin?",
      options: ["YES", "NO", "DON'T KNOW"],
      images: [dryImg, dryImg, dryImg],
      multiple: false,
    },
    {
      label: "Where is your main concern?",
      options: [
        "CHEEKS", "T-ZONE", "CHIN", "ARMS/HANDS", "LEGS/FEET", "NECK",
        "SHOULDERS", "BACK", "CHEST"
      ],
      images: [dryImg, dryImg, dryImg, dryImg, dryImg, dryImg, dryImg, dryImg, dryImg],
      multiple: true,
    },
  ];
  
  const lifestyleQuestions = [
    {
      label: "Are you a morning bird or a night owl?",
      options: ["MORNING BIRD", "NIGHT ORL", "NEITHER"],
      images: [dryImg, dryImg, dryImg],
      multiple: false,
    },
    {
      label: "How many hours do you exercise per week?",
      options: ["0-2", "3-6", "7+"],
      images: [dryImg, dryImg, dryImg],
      multiple: false,
    },
    {
      label: "How many hours of sleep do you typically get each night?",
      options: ["6 OR LESS", "7-8", "9-10"],
      images: [dryImg, dryImg, dryImg, dryImg],
      multiple: false,
    },
  ];  

  const handleSelect = (value) => {
    const currentQuestions = currentStep === 1 ? medicalQuestions : lifestyleQuestions;
    const currentQuestionData = currentQuestions[currentQuestion];
  
    if (currentQuestionData.multiple) {
      const prevValues = formData[currentQuestionData.label] || [];
      const newValues = prevValues.includes(value)
        ? prevValues.filter((item) => item !== value)
        : [...prevValues, value];
      setFormData({
        ...formData,
        [currentQuestionData.label]: newValues,
      });
    } else {
      setFormData({ ...formData, [currentQuestionData.label]: value });
      handleNext();
    }
  };  

  const handleNext = () => {
    if (currentStep === 1) {
      if (currentQuestion < (currentStep === 1 ? medicalQuestions : lifestyleQuestions).length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        carouselRef.current?.next();
      } else {
        setCurrentStep(2);
      }
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
              {currentStep === 1 && medicalQuestions.concat(lifestyleQuestions).map((question, index) => (
                <div key={index}>
                  <h3 className="question-title">{question.label}</h3>
                  <Row gutter={[16, 16]} className="options">
                    {question.options.map((option, idx) => (
                      <Col span={8} key={idx}>
                        <div
                          className={`option-circle ${
                            formData[question.label]?.includes(option) ? "selected" : ""
                          }`}
                          onClick={() => handleSelect(option)}
                        >
                          {question.images && question.images[idx] ? (
                            <img src={question.images[idx]} alt={option} />
                          ) : (
                            <span className="option-text">{option}</span>
                          )}
                        </div>
                        <p className="option-text">{option}</p> {/* Text label below the image */}
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
            <h3>Upload a high resolution image of your skin</h3>
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
