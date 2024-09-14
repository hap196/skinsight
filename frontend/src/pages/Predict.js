import React, { useState } from "react";
import axios from "axios";

const Predict = ({quizData}) => {
  // states
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // hooks
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setPrediction(null);
    setGptResponse(null);

    // set as form data because we want to include image + multiselect
    const formData = new FormData();
    formData.append("file", file);
    for (const key in quizData) {
      formData.append(key, quizData[key]);
    }

    // post to the flask app
    try {
      // axios.post returns the json prediction response from backend
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData
      );
      // update states based on prediction from backend
      setPrediction(response.data.predicted_disease_class);
      setGptResponse(response.data.skincare_recommendations);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Predict">
      <h1>Skinsight</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={isLoading || !file}>
          {isLoading ? "Processing..." : "Predict"}
        </button>
      </form>

      {isLoading && <p>Processing your image...</p>}

      {prediction && (
        <div>
          <h2>Identified skin concerns:</h2>
          <p>{prediction}</p>
        </div>
      )}

      {gptResponse && (
        <div>
          <h2>Skincare Recommendations:</h2>
          <pre>{gptResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default Predict;