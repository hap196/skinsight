import React, { useState } from "react";

const Music = () => {
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");
  const [mv, setMv] = useState("");
  const [trackId, setTrackId] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const base_url = process.env.REACT_APP_BASE_URL;
  const authToken = process.env.REACT_APP_AUTH_TOKEN;

  async function generateMusic() {
    try {
      console.log("base_url", base_url);
      const response = await fetch(`${base_url}/api/generate/v2`, {
        mode: "no-cors",

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ auth, prompt, tags, mv }),
      });

      if (response.ok) {
        const data = await response.json();
        setTrackId(data.trackId); 
        playAudio(data.trackId);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function playAudio(trackId) {
    try {
      const response = await fetch(`${base_url}/api/generate/${trackId}`, {
        mode: "no-cors",

        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.audioUrl; // Adjust based on actual response
        setAudioUrl(url);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <h1>Generate Music</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt"
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Enter tags"
      />
      <input
        type="text"
        value={mv}
        onChange={(e) => setMv(e.target.value)}
        placeholder="Enter mv"
      />
      <button onClick={generateMusic}>Generate Music</button>
      {audioUrl && (
        <div>
          <h2>Audio Preview</h2>
          <audio controls>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default Music;
