import React, { useState } from "react";

const Music = () => {
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");
  const [mv, setMv] = useState("");
  const [trackId, setTrackId] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const base_url = "http://localhost:5000"; // Your local Flask server URL
  const authToken = process.env.REACT_APP_AUTH_TOKEN;

  async function generateMusic() {
    console.log("Generating music...");
    try {
      const response = await fetch(`${base_url}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt, tags, mv }),
        credentials: 'include',
      });

      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Received data:", data);
        setTrackId(data.trackId);
        playAudio(data.trackId);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function playAudio(trackId) {
    console.log("Playing audio for trackId:", trackId);
    try {
      const response = await fetch(
        `${base_url}/api/feed/v2/?track_id=${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          credentials: 'include',
        }
      );

      console.log("Audio response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Received audio data:", data);
        const url = data.audioUrl; // Adjust based on actual response
        setAudioUrl(url);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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