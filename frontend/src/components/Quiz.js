import React, { useState } from "react";
import axios from "axios";
import { Button, Steps, Row, Col, message } from "antd";
import { CheckCircleOutlined, FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";


const stepsData = [
 { title: "Login" },
 { title: "Questions" },
 { title: "Upload Image" },
];


const handleLogin = () => {
 window.location.href = "http://localhost:5001/login";
};


const SkinAIForm = () => {
 const [currentStep, setCurrentStep] = useState(0); // Step tracker
 const [formData, setFormData] = useState({}); // Store form answers
 const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks the specific question in the Questions step
 const [file, setFile] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
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


   if (currentStep === 1 && currentQuestion < questions.length - 1) {
     setCurrentQuestion(currentQuestion + 1);
   } else if (currentStep === 1 && currentQuestion === questions.length - 1) {
     setCurrentStep(2);
   }
 };


 const handleBack = () => {
   if (currentStep === 1 && currentQuestion > 0) {
     setCurrentQuestion(currentQuestion - 1);
   } else if (currentStep > 0) {
     setCurrentStep(currentStep - 1);
   }
 };


 const handleSkip = () => {
   if (currentStep === 1 && currentQuestion < questions.length - 1) {
     setCurrentQuestion(currentQuestion + 1);
   } else if (currentStep === 1 && currentQuestion === questions.length - 1) {
     setCurrentStep(2);
   } else if (currentStep === 0) {
     setCurrentStep(1);
   }
 };


 const handleFileChange = (e) => {
   setFile(e.target.files[0]);
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
     // post a prediction to the predict endpoint
     const response = await axios.post("http://127.0.0.1:5001/predict", formDataToSend);
     const prediction = response.data.predicted_disease_class;
     const gptResponse = response.data.skincare_recommendations;
    
     // pass predictions to results page then redirect
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


 return (
   <div className="form-container">
     <Steps current={currentStep}>
       {stepsData.map((step, index) => (
         <Steps.Step key={index} title={step.title} icon={currentStep > index ? <CheckCircleOutlined /> : undefined} />
       ))}
     </Steps>
     {currentStep === 0 && (
       <div>
         <button onClick={handleLogin}>Login with Google</button>
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
               <div className="option-box" onClick={() => handleSelect(option)}>
                 {questions[currentQuestion].icons && questions[currentQuestion].icons[index]}
                 <p>{option}</p>
               </div>
             </Col>
           ))}
         </Row>
         <div className="navigation-buttons">
           {currentStep > 0 && (
             <Button onClick={handleBack} disabled={currentStep === 0 && currentQuestion === 0}>
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
         <input type="file" onChange={handleFileChange} />
         <Button type="primary" onClick={handleSubmit} disabled={!file || isLoading}>
           {isLoading ? "Processing..." : "Upload and Predict"}
         </Button>
       </div>
     )}
   </div>
 );
};


export default SkinAIForm;