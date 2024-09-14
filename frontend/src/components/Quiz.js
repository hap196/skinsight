import React, { useState } from "react";
import { Form, Button, Steps, Row, Col, message } from "antd";
import {
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FrownOutlined,
  MehOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Quiz.css";
import Predict from '../pages/Predict';

const stepsData = [
  { title: "Login" },
  { title: "Questions" },
  { title: "Upload Image" },
];

const SkinAIForm = () => {
  const [currentStep, setCurrentStep] = useState(0); // Step tracker
  const [formData, setFormData] = useState({}); // Store form answers
  const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks the specific question in the Questions step
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const questions = [
    {
      label: "What is your skin type?",
      options: ["Dry", "Combination", "Oily"],
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
    setFormData({ ...formData, [questions[currentQuestion].label]: value });

    // If there are more questions, go to the next one
    if (currentStep === 1 && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentStep === 1 && currentQuestion === questions.length - 1) {
      // If it was the last question, move to the Upload Image step
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    // If in questions, go back within the questions
    if (currentStep === 1 && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentStep > 0) {
      // Otherwise, go back to the previous step
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip the current question or step
    if (currentStep === 1 && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentStep === 1 && currentQuestion === questions.length - 1) {
      setCurrentStep(2);
    } else if (currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handleImageUpload = () => {
    // Simulate image upload success
    message.success("File uploaded successfully");

    // After successful upload, navigate to the profile page
    navigate("/profile");
  };

  return (
    <div className="form-container">
      <Steps current={currentStep}>
        {stepsData.map((step, index) => (
          <Steps.Step
            key={index}
            title={step.title}
            icon={currentStep > index ? <CheckCircleOutlined /> : undefined}
          />
        ))}
      </Steps>
      {currentStep === 0 && (
        <div>
          {/* Add any future Login content here */}
          <Button type="link" onClick={handleSkip}>
            Skip
          </Button>
        </div>
      )}
      {currentStep === 1 && currentQuestion < questions.length && (
        <div>
          <h3>{questions[currentQuestion].label}</h3>
          <Row gutter={[16, 16]}>
            {questions[currentQuestion].options.map((option, index) => (
              <Col span={8} key={option}>
                <div
                  className="option-box"
                  onClick={() => handleSelect(currentQuestion, option)}
                >
                  {questions[currentQuestion].icons &&
                    questions[currentQuestion].icons[index]}
                  <p>{option}</p>
                </div>
              </Col>
            ))}
          </Row>
          <div className="navigation-buttons">
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                disabled={currentStep === 0 && currentQuestion === 0}
              >
                Back
              </Button>
            )}
            <Button type="link" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h3>Upload a clear image of your skin</h3>
          <p>Ensure the image is clear for better analysis.</p>
          {/* Add Upload component */}
          <Button
            type="primary"
            onClick={() => message.success("File uploaded successfully")}
          >
            Upload Image
          </Button>
          <Predict quizData={formData} />
        </div>
      )}
    </div>
  );
};

export default SkinAIForm;
