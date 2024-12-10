import React, { createContext, useContext, useState, ReactNode } from "react";

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

  const toggleAssistantVisible = () => {
    setAssistantMinimized((prev) => !prev);
  };

  return (
    <GlobalContext.Provider
      value={{ assistantMinimized, toggleAssistantVisible }}
    >
      {children}
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
