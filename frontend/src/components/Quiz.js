import React, { useState } from "react";
import axios from "axios";
import { Row, Col, message, Carousel, Steps, Upload, Button, Spin } from "antd";
import { CheckCircleOutlined, LeftOutlined, RightOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";
import button1 from "../assets/buttons/button1.png";
import button2 from "../assets/buttons/button2.png";
import button3 from "../assets/buttons/button3.png";
import button4 from "../assets/buttons/button4.png";
import button5 from "../assets/buttons/button5.png";
import button6 from "../assets/buttons/button6.png";
import button7 from "../assets/buttons/button7.png";
import button8 from "../assets/buttons/button8.png";
import button9 from "../assets/buttons/button9.png";

const SkinAIForm = () => {
  const [formData, setFormData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null); // Store file here
  const [fileList, setFileList] = useState([]); // Store file list
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [songReady, setSongReady] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const navigate = useNavigate();
  const carouselRef = React.useRef();

  const stepsData = [
    { title: "Medical" },
    { title: "Lifestyle" },
    { title: "Upload Image" },
  ];

  const medicalQuestions = [
    {
      label: "What best describes your skin type?",
      options: ["DRY", "COMBINATION", "OILY"],
      multiple: false,
      images: [button1, button2, button3],
    },
    {
      label: "Do you have sensitive skin?",
      options: ["YES", "NO", "DON'T KNOW"],
      multiple: false,
      images: [button1, button2, button3],
    },
    {
      label: "What skin concerns would you like to target?",
      options: [
        "LARGE PORES", "WRINKLES", "SUNSPOTS", "BUMPY SKIN", "SEBACEOUS FILAMENTS",
        "HYPERPIGMENTATION", "BLACKHEADS", "ACNE SCARS", "FLAKY SKIN"
      ],
      images: [
        button1, button2, button3, button4, button5, button6, button7, button8, button9
      ],
      multiple: true,
    },
    {
      label: "Where are your skin concerns located?",
      options: [
        "T-ZONE", "CHEEKS", "CHIN", "NECK", "SHOULDERS",
        "BACK", "CHEST", "ARMS/HANDS", "LEGS/FEET"
      ],
      images: [
        button1, button2, button3, button4, button5, button6, button7, button8, button9
      ],
      multiple: true,
    },
  ];

  const lifestyleQuestions = [
    {
      label: "Are you a morning bird or a night owl?",
      options: ["MORNING BIRD", "NIGHT OWL", "NEITHER"],
      images: [button1, button2, button3],
      multiple: false,
    },
    {
      label: "How many hours do you exercise per week?",
      options: ["0-2", "3-6", "7+"],
      images: [button1, button2, button3],
      multiple: false,
    },
    {
      label: "How many hours do you sleep each day?",
      options: ["6 OR LESS", "7-8", "9-10"],
      images: [button1, button2, button3],
      multiple: false,
    },
  ];

  const handleSelect = (value) => {
    const currentQuestions = currentStep === 0 ? medicalQuestions : lifestyleQuestions;
    const currentQuestionData = currentQuestions[currentQuestion];

    const selectedValue = currentQuestionData.multiple
      ? (formData[currentQuestionData.label] || []).includes(value)
        ? formData[currentQuestionData.label].filter((item) => item !== value)
        : [...(formData[currentQuestionData.label] || []), value]
      : value;

    setFormData({ ...formData, [currentQuestionData.label]: selectedValue });
  };

  const handleImageUpload = ({ fileList }) => {
    if (fileList.length > 0) {
      setFile(fileList[0].originFileObj);
      setFileList(fileList);
      message.success("File uploaded successfully");
    } else {
      setFile(null);
      setFileList([]);
    }
  };

  const generateSong = async () => {
    setIsGeneratingSong(true);
    setSongReady(false);

    try {
      const response = await axios.post("http://127.0.0.1:5001/generate", {
        gpt_description_prompt: "A song based on your lifestyle",
        music_style: formData["Are you a morning bird or a night owl?"],
      });

      const { song_id } = response.data;

      const pollInterval = setInterval(async () => {
        const audioResponse = await axios.get(`http://127.0.0.1:5001/check_audio/${song_id}`);
        const { audio_url } = audioResponse.data;

        if (audio_url) {
          clearInterval(pollInterval);
          setIsGeneratingSong(false);
          setSongReady(true);
          setAudioUrl(audio_url);
          setCurrentStep(2);
        }
      }, 5000);
    } catch (error) {
      console.error("Error generating song:", error);
      message.error("Error generating the song. Please try again.");
      setIsGeneratingSong(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      message.error("Please upload a file before you submit.");
      return;
    }

    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post("http://127.0.0.1:5001/predict", formDataToSend);
      const prediction = response.data.predicted_disease_class;
      const gptResponse = response.data.skincare_recommendations;

      navigate("/results", { state: { prediction, gptResponse, audio_url: audioUrl } });
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

  const handleNext = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentStep === 0 && currentQuestion < medicalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      carouselRef.current.next();
    } else if (currentStep === 0 && currentQuestion === medicalQuestions.length - 1) {
      setCurrentStep(1);
      setCurrentQuestion(0);
    } else if (currentStep === 1 && currentQuestion < lifestyleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      carouselRef.current.next();
    } else if (currentStep === 1 && currentQuestion === lifestyleQuestions.length - 1) {
      await generateSong();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setCurrentQuestion(lifestyleQuestions.length - 1);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      carouselRef.current.prev();
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 1) {
        setCurrentQuestion(medicalQuestions.length - 1);
      } else if (currentStep === 0) {
        setCurrentQuestion(0);
      }
    }
  };

  const renderStep = () => {
    if (currentStep === 2) {
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
            disabled={!file || isLoading}
          >
            {isLoading ? "Processing..." : "Submit"}
          </Button>
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
            onClick={handleSubmit} // Existing submit handler
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

      {isGeneratingSong && (
        <div className="loading-indicator">
          <Spin tip="Generating a song just for you..." />
        </div>
      )}

      {songReady && <p>Your song is ready! Proceeding to image upload...</p>}

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
