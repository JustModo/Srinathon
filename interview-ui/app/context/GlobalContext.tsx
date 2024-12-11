import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { SocketProvider } from "./SocketContext";

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

interface GlobalContextType {
  assistantMinimized: boolean;
  toggleAssistantVisible: () => void;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [assistantMinimized, setAssistantMinimized] = useState<boolean>(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const toggleAssistantVisible = () => {
    setAssistantMinimized((prev) => !prev);
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setPermissionsGranted(true);
        console.log("Microphone and webcam permissions granted.");
      } catch (err) {
        console.error("Failed to get permissions:", err);
        alert("Please allow access to microphone and webcam to proceed.");
        setPermissionsGranted(false);
      }
    };

    requestPermissions();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ assistantMinimized, toggleAssistantVisible }}
    >
      <SocketProvider>{permissionsGranted && children}</SocketProvider>
    </GlobalContext.Provider>
  );
};

export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
