import React, { useState } from "react";
import axios from "axios";
import { Row, Col, message, Carousel, Steps, Upload, Button } from "antd";
import { CheckCircleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
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
      options: ["MORNING BIRD", "NIGHT OWL", "NEITHER"],
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

    const selectedValue = currentQuestionData.multiple
      ? (formData[currentQuestionData.label] || []).includes(value)
        ? formData[currentQuestionData.label].filter((item) => item !== value)
        : [...(formData[currentQuestionData.label] || []), value]
      : value;

    setFormData({ ...formData, [currentQuestionData.label]: selectedValue });
  };

  const handleNext = () => {
    const totalQuestions = currentStep === 1 ? medicalQuestions.length : lifestyleQuestions.length;
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      carouselRef.current.next();
    } else if (currentStep === 1) {
      setCurrentStep(2); // Move to Lifestyle after Medical
      setCurrentQuestion(0); // Reset question index for lifestyle
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      carouselRef.current.prev();
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentQuestion(currentStep === 2 ? lifestyleQuestions.length - 1 : medicalQuestions.length - 1); // Handle step transitions
    }
  };

  const renderStep = () => {
    const questions = currentStep === 1 ? medicalQuestions : lifestyleQuestions;
    return (
      <div className="form-content">
        <Carousel ref={carouselRef} dots={false} effect="scrollx">
          {questions.map((question, index) => (
            <div key={index}>
              <h3 className="question-title">{question.label}</h3>
              <Row gutter={[16, 16]} className="options">
                {question.options.map((option, idx) => (
                  <Col span={8} key={idx}>
                    <div
                      className={`option-circle ${formData[question.label]?.includes(option) ? "selected" : ""}`}
                      onClick={() => handleSelect(option)}
                    >
                      <img src={question.images[idx]} alt={option} />
                    </div>
                    <p className="option-text">{option}</p>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>
        <div className="navigation-buttons">
          <a className="nav-link" onClick={handleBack}>
            <LeftOutlined /> Back
          </a>
          <a className="nav-link" onClick={handleNext}>
            Next <RightOutlined />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="form-wrapper">
      <h2 className="page-title">insight into you</h2>
      <div className="steps-container">
        <Steps current={currentStep}>
          {stepsData.map((step, index) => (
            <Steps.Step
              key={index}
              title={step.title}
              icon={currentStep > index ? <CheckCircleOutlined /> : undefined}
              style={{ color: currentStep === index ? '#3dbdb0' : '' }} // Teal for active step
            />
          ))}
        </Steps>
      </div>
      <div className="form-container">{renderStep()}</div>
    </div>
  );
};

export default SkinAIForm;
