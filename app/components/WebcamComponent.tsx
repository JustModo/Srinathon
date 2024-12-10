// import React from "react";
import Webcam from "react-webcam";

export default function WebcamComponent() {
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user", // Front-facing camera
  };

  return (
    <div className="w-full z-10">
      <Webcam
        className="w-full h-auto"
        videoConstraints={videoConstraints}
        audio={false} // Disable audio if not needed
        style={{
          transform: "scaleX(-1)", // Mirrors the video feed
        }}
      />
    </div>
  );
}
