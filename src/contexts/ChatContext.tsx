// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  addMessages: (messages: ChatMessage[]) => void;
  clearChat: () => void;
  resetToWelcome: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Welcome message constant
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  text: "Hello! I'm your AI mood companion 💫 I'm here to listen and help you understand your feelings better. Remember, after you log out, all of your chat history will be gone. How are you feeling today?",
  isUser: false,
  timestamp: new Date(),
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const addMessages = (newMessages: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  };

  const clearChat = () => {
    setMessages([]);
    console.log("🧹 Chat cleared completely");
  };

  const resetToWelcome = () => {
    setMessages([WELCOME_MESSAGE]);
    console.log("🔄 Chat reset to welcome message");
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        addMessages,
        clearChat,
        resetToWelcome,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChatHistory = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
