// import React from "react";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useSocket } from "~/context/SocketContext";

export default function WebcamComponent() {
  const [isStreaming, setIsStreaming] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const { testSocket } = useSocket();

  useEffect(() => {
    const startAudioStream = async () => {
      if (!testSocket) {
        console.log("Not connected");
        return;
      }
      if (isStreaming) return;
      setIsStreaming(true);
      testSocket?.emit("start_stream");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            testSocket?.emit("stream", event.data);
            console.log("Sent audio chunk:", event.data);
          }
        };

        mediaRecorder.start(250); // Send audio data every 250ms
        mediaRecorderRef.current = mediaRecorder;
        console.log("Audio streaming started.");
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Failed to access microphone. Please allow microphone access.");
        setIsStreaming(false);
      }
    };

    const stopAudioStream = () => {
      if (!isStreaming) return;
      mediaRecorderRef.current?.stop();
      console.log("Audio streaming stopped.");
      testSocket?.emit("stop_stream");
      setIsStreaming(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "T" || event.key === "t") {
        console.log("Press");
        startAudioStream();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "T" || event.key === "t") {
        console.log("Pressed");

        stopAudioStream();
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      stopAudioStream();
    };
  }, [isStreaming, testSocket]);

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
