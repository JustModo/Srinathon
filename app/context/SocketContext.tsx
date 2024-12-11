import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextProps {
  testSocket: Socket | null;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

const urlObj: Record<"behaviour" | "coding", string> = {
  behaviour: "http://localhost:3000/behaviour",
  coding: "http://localhost:3000/coding",
};

export const SocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [testSocket, setTestSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const baseSocket = io("http://localhost:3000/base");

    baseSocket.on("state", (url: keyof typeof urlObj) => {
      if (urlObj[url]) {
        const newSocket = io(urlObj[url]);
        setTestSocket(newSocket);
      }
    });

    return () => {
      baseSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ testSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use the Socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
