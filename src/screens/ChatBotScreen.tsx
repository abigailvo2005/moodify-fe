import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBotScreen({ navigation }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hello! I'm your AI mood companion 💫 I'm here to listen and help you understand your feelings better. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Simple AI response generator (you can replace this with actual AI service)
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // This is a simple mock AI response - replace with actual AI service
    const responses = [
      "I understand how you're feeling. It's completely normal to experience different emotions throughout the day. Tell me more about what's on your mind.",
      "Thank you for sharing that with me. Your feelings are valid, and it's important to acknowledge them. What do you think might help you feel better?",
      "That sounds like a challenging situation. Remember that it's okay to feel this way. Have you tried any coping strategies that have worked for you before?",
      "I hear you. Sometimes talking about our feelings can be really helpful. What's one small thing that usually brings you comfort?",
      "It's great that you're taking time to reflect on your emotions. Self-awareness is the first step toward emotional well-being. How long have you been feeling this way?",
      "Your emotional journey is unique to you. What you're experiencing matters. Is there anything specific that triggered these feelings today?",
      "Thank you for trusting me with your thoughts. Remember, it's okay to have ups and downs - that's part of being human. What would make today a little bit better for you?",
    ];

    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("down") ||
      lowerMessage.includes("depressed")
    ) {
      return "I'm sorry you're feeling sad. It's okay to feel this way sometimes. Would you like to talk about what might be causing these feelings? Sometimes sharing can help lighten the emotional load.";
    }

    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great")
    ) {
      return "I'm so glad to hear you're feeling happy! It's wonderful when we experience positive emotions. What's contributing to your good mood today? Celebrating these moments is important.";
    }

    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("mad") ||
      lowerMessage.includes("frustrated")
    ) {
      return "I can sense your frustration. Anger is a normal emotion that tells us something important needs attention. Would you like to explore what's behind these feelings? Sometimes understanding the 'why' can help.";
    }

    if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worried") ||
      lowerMessage.includes("stress")
    ) {
      return "Anxiety can feel overwhelming, but you're not alone in this. Taking deep breaths and grounding yourself in the present moment can help. What's one thing you can see, hear, or feel right now that brings you calm?";
    }

    if (
      lowerMessage.includes("tired") ||
      lowerMessage.includes("exhausted") ||
      lowerMessage.includes("drained")
    ) {
      return "Feeling tired can affect our whole mood. Are you getting enough rest? Sometimes emotional exhaustion is just as real as physical tiredness. What would help you recharge today?";
    }

    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return "You're very welcome! I'm here whenever you need someone to listen. Remember, taking care of your emotional well-being is just as important as taking care of your physical health. 💕";
    }

    // Default response
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Simulate AI thinking time
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      const aiResponse = await generateAIResponse(userMessage.text);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log("Error generating AI response:", error);
      Alert.alert(
        "Error",
        "Sorry, I'm having trouble responding right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setMessages([
              {
                id: "welcome",
                text: "Hello! I'm your AI mood companion 💫 I'm here to listen and help you understand your feelings better. How are you feeling today?",
                isUser: false,
                timestamp: new Date(),
              },
            ]);
          },
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <LinearGradient
        colors={["#deb9b6", "#9383c7"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="rgba(93, 22, 40, 0.8)" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Mood Assistant</Text>
          <Text style={styles.headerSubtitle}>Here to listen & help 💫</Text>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Ionicons name="refresh" size={24} color="rgba(93, 22, 40, 0.8)" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser
                ? styles.userMessageContainer
                : styles.aiMessageContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser
                    ? styles.userMessageText
                    : styles.aiMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isUser
                    ? styles.userMessageTime
                    : styles.aiMessageTime,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="rgba(93, 22, 40, 0.6)" />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Share your feelings..."
            placeholderTextColor="rgba(93, 22, 40, 0.4)"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name={isLoading ? "hourglass" : "send"}
              size={20}
              color={
                !inputText.trim() || isLoading
                  ? "rgba(93, 22, 40, 0.3)"
                  : "rgba(93, 22, 40, 0.8)"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    marginTop: 2,
  },

  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },

  messageContainer: {
    marginBottom: 16,
  },

  userMessageContainer: {
    alignItems: "flex-end",
  },

  aiMessageContainer: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  userMessage: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    borderBottomRightRadius: 8,
  },

  aiMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomLeftRadius: 8,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Fredoka",
  },

  userMessageText: {
    color: "rgba(93, 22, 40, 0.9)",
  },

  aiMessageText: {
    color: "rgba(93, 22, 40, 0.8)",
  },

  messageTime: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: "Fredoka",
  },

  userMessageTime: {
    color: "rgba(93, 22, 40, 0.6)",
    textAlign: "right",
  },

  aiMessageTime: {
    color: "rgba(93, 22, 40, 0.5)",
    textAlign: "left",
  },

  loadingContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },

  loadingBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    marginLeft: 8,
  },

  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "Fredoka",
    maxHeight: 100,
    paddingVertical: 8,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  sendButtonDisabled: {
    backgroundColor: "rgba(243, 180, 196, 0.3)",
  },
});
