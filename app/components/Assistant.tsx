// import React from 'react'
import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { useEffect } from "react";
import { useGlobal } from "~/context/GlobalContext";
import { useSocket } from "~/context/SocketContext";

export default function Assitant() {
  const { assistantMinimized, toggleAssistantVisible } = useGlobal();
  const { testSocket } = useSocket();

  useEffect(() => {
    if (!testSocket) return;

    testSocket.on("speak", (message) => {
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
    });

    return () => {
      testSocket.off("speak");
    };
  }, [testSocket]);

  return (
    <motion.div
      className={`absolute w-screen h-screen bg-[#1e1f20] z-10 ${
        assistantMinimized && "pointer-events-none"
      }`}
      initial={{
        opacity: 1,
        backgroundColor: "rgba(0,0,0,1)",
      }}
      animate={{
        backgroundColor: assistantMinimized ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)",
      }}
      transition={{
        duration: 1,
      }}
    >
      <motion.div
        className="absolute bg-[#282a2c] rounded-full p-2 flex items-center justify-around"
        initial={{
          width: "400px",
          height: "400px",
          top: "50%",
          left: "50%",
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: assistantMinimized ? "170px" : "400px",
          height: assistantMinimized ? "170px" : "400px",
          top: assistantMinimized ? "10px" : "50%",
          left: assistantMinimized ? "35px" : "50%",
          translateX: assistantMinimized ? "0" : "-50%",
          translateY: assistantMinimized ? "0" : "-50%",
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
        }}
        onClick={() => toggleAssistantVisible()}
      >
        <UserRound />
      </motion.div>
    </motion.div>
  );
}
