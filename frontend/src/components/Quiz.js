import React, { useState } from "react";
import axios from "axios";
import { Row, Col, message, Carousel, Steps, Upload, Button } from "antd";
import { CheckCircleOutlined, LeftOutlined, RightOutlined, UploadOutlined } from "@ant-design/icons";
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

const SkinAIForm = () => {
  const [formData, setFormData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null); // Store file here
  const [fileList, setFileList] = useState([]); // Store file list
  const [isLoading, setIsLoading] = useState(false); // Loading state
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
  ];

  // Handle select for quiz options
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

  // Handle file upload and store in state
  const handleImageUpload = ({ fileList }) => {
    // Always set the first file uploaded
    if (fileList.length > 0) {
      setFile(fileList[0].originFileObj); // Ensure file is properly set
      setFileList(fileList); // Set the fileList
      message.success("File uploaded successfully");
    } else {
      setFile(null); // Reset if no file is present
      setFileList([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      message.error("Please upload a file before submitting.");
      return;
    }

    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("file", file); // Append the uploaded file
    for (const key in formData) {
      formDataToSend.append(key, formData[key]); // Append quiz answers
    }

    try {
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

  // Handle next button click
  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1 && currentQuestion < medicalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      carouselRef.current.next();
    } else if (currentStep === 1 && currentQuestion === medicalQuestions.length - 1) {
      setCurrentStep(2);
      setCurrentQuestion(0); // Reset question index for lifestyle
    } else if (currentStep === 2 && currentQuestion < lifestyleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      carouselRef.current.next();
    } else if (currentStep === 2 && currentQuestion === lifestyleQuestions.length - 1) {
      setCurrentStep(3); // Move to upload image step
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2); // Go back to lifestyle questions
      setCurrentQuestion(lifestyleQuestions.length - 1); // Go to the last lifestyle question
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      carouselRef.current.prev();
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setCurrentQuestion(medicalQuestions.length - 1);
      } else if (currentStep === 1) {
        setCurrentQuestion(0);
      }
    }
  };

  // Render current step
  const renderStep = () => {
    if (currentStep === 0) {
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
    }

    if (currentStep === 3) {
      return (
        <div className="form-content">
          <h3 className="question-title">Upload an image of your skin concern</h3>
          <Upload
            fileList={fileList}
            onChange={handleImageUpload}
            listType="picture"
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!file || isLoading} // Enable submit button only if a file is uploaded
          >
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </div>
      );
    }

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
              style={{ color: currentStep === index ? "#3dbdb0" : "" }}
            />
          ))}
        </Steps>
      </div>
      <div className="form-container">{renderStep()}</div>
      <div className="fixed-navigation">
        <a className="nav-link" onClick={handleBack}>
          <LeftOutlined /> BACK
        </a>
        <a className="nav-link" onClick={handleNext}>
          NEXT <RightOutlined />
        </a>
      </div>
    </div>
  );
};

export default SkinAIForm;
