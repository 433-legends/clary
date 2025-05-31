"use client";

import * as React from "react";

type ChatbotContextProps = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
};

const ChatbotContext = React.createContext<ChatbotContextProps | null>(null);

export function useChatbot() {
  const context = React.useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider.");
  }
  return context;
}

interface ChatbotProviderProps {
  children: React.ReactNode;
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isOpen, setOpen] = React.useState(false);

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      isOpen,
      setOpen,
      toggle,
    }),
    [isOpen, setOpen, toggle]
  );

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
} 