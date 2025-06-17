// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Alert,
//   Keyboard,
//   Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAuth } from "../contexts/AuthContext";
// import { aiService } from "../services/aiServices";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { height: screenHeight } = Dimensions.get("window");

// interface ChatMessage {
//   id: string;
//   text: string;
//   isUser: boolean;
//   timestamp: Date;
// }

// export default function ChatBotScreen({ navigation }: any) {
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       id: "welcome",
//       text: "Hello! I'm your AI mood companion 💫 I'm here to listen and help you understand your feelings better. How are you feeling today?",
//       isUser: false,
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputText, setInputText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const scrollViewRef = useRef<ScrollView>(null);
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();

//   // Keyboard listeners
//   useEffect(() => {
//     const keyboardWillShowListener = Keyboard.addListener(
//       Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
//       (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//         // Auto scroll to bottom when keyboard shows
//         setTimeout(() => {
//           scrollViewRef.current?.scrollToEnd({ animated: true });
//         }, 100);
//       }
//     );

//     const keyboardWillHideListener = Keyboard.addListener(
//       Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
//       () => {
//         setKeyboardHeight(0);
//       }
//     );

//     return () => {
//       keyboardWillShowListener.remove();
//       keyboardWillHideListener.remove();
//     };
//   }, []);

//   useEffect(() => {
//     // Auto scroll to bottom when new messages are added
//     setTimeout(() => {
//       scrollViewRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   }, [messages]);

//   // Simple AI response generator (you can replace this with actual AI service)
//   const generateAIResponse = async (userMessage: string): Promise<string> => {
//     try {
//       console.log("🤖 Generating AI response for:", userMessage);

//       const response = await aiService.generateMoodResponse(
//         userMessage,
//         user?.name // Pass user name for personalization
//       );

//       console.log("✅ AI response generated");
//       return response;
//     } catch (error) {
//       console.error("❌ AI Error:", error);
//       return "I'm having trouble responding right now, but I'm still here to listen. Please try again in a moment. 💙";
//     }
//   };

//   const sendMessage = async () => {
//     if (!inputText.trim()) return;

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       text: inputText.trim(),
//       isUser: true,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputText("");
//     setIsLoading(true);

//     try {
//       // Simulate AI thinking time
//       await new Promise((resolve) =>
//         setTimeout(resolve, 1000 + Math.random() * 2000)
//       );

//       const aiResponse = await generateAIResponse(userMessage.text);

//       const aiMessage: ChatMessage = {
//         id: (Date.now() + 1).toString(),
//         text: aiResponse,
//         isUser: false,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.log("Error generating AI response:", error);
//       Alert.alert(
//         "Error",
//         "Sorry, I'm having trouble responding right now. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearChat = () => {
//     Alert.alert(
//       "Clear Chat",
//       "Are you sure you want to clear this conversation?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Clear",
//           style: "destructive",
//           onPress: () => {
//             setMessages([
//               {
//                 id: "welcome",
//                 text: "Hello! I'm your AI mood companion 💫 I'm here to listen and help you understand your feelings better. How are you feeling today?",
//                 isUser: false,
//                 timestamp: new Date(),
//               },
//             ]);
//           },
//         },
//       ]
//     );
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   return (
//     <View style={[styles.container]}>
//       <LinearGradient
//         colors={["#deb9b6", "#9383c7"]}
//         style={StyleSheet.absoluteFill}
//       />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="arrow-back" size={24} color="rgba(93, 22, 40, 0.8)" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>AI Mood Assistant</Text>
//           <Text style={styles.headerSubtitle}>Here to listen & help 💫</Text>
//         </View>

//         <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
//           <Ionicons name="refresh" size={24} color="rgba(93, 22, 40, 0.8)" />
//         </TouchableOpacity>
//       </View>

//       {/* Messages */}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.messagesContainer}
//         contentContainerStyle={[
//           styles.messagesContent,
//           { paddingBottom: Math.max(keyboardHeight, 100) + 80 }, // Extra padding for keyboard
//         ]}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         {messages.map((message) => (
//           <View
//             key={message.id}
//             style={[
//               styles.messageContainer,
//               message.isUser
//                 ? styles.userMessageContainer
//                 : styles.aiMessageContainer,
//             ]}
//           >
//             <View
//               style={[
//                 styles.messageBubble,
//                 message.isUser ? styles.userMessage : styles.aiMessage,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.messageText,
//                   message.isUser
//                     ? styles.userMessageText
//                     : styles.aiMessageText,
//                 ]}
//               >
//                 {message.text}
//               </Text>
//               <Text
//                 style={[
//                   styles.messageTime,
//                   message.isUser
//                     ? styles.userMessageTime
//                     : styles.aiMessageTime,
//                 ]}
//               >
//                 {formatTime(message.timestamp)}
//               </Text>
//             </View>
//           </View>
//         ))}

//         {isLoading && (
//           <View style={styles.loadingContainer}>
//             <View style={styles.loadingBubble}>
//               <ActivityIndicator size="small" color="rgba(93, 22, 40, 0.6)" />
//               <Text style={styles.loadingText}>AI is thinking...</Text>
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {/* Input Area - Fixed at bottom */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 45}
//       >
//         <View
//           style={[
//             styles.inputContainer,
//             {
//               paddingBottom: 40,
//               marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
//             },
//           ]}
//         >
//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Share your feelings..."
//               placeholderTextColor="rgba(93, 22, 40, 0.4)"
//               multiline
//               maxLength={500}
//               editable={!isLoading}
//               onSubmitEditing={sendMessage}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               style={[
//                 styles.sendButton,
//                 (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
//               ]}
//               onPress={sendMessage}
//               disabled={!inputText.trim() || isLoading}
//             >
//               <Ionicons
//                 name={isLoading ? "hourglass" : "send"}
//                 size={20}
//                 color={
//                   !inputText.trim() || isLoading
//                     ? "rgba(93, 22, 40, 0.3)"
//                     : "rgba(93, 22, 40, 0.8)"
//                 }
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255, 255, 255, 0.2)",
//     paddingTop: 30,
//   },

//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "rgba(93, 22, 40, 0.9)",
//     fontFamily: "FredokaSemiBold",
//   },

//   headerSubtitle: {
//     fontSize: 12,
//     color: "rgba(93, 22, 40, 0.6)",
//     fontFamily: "Fredoka",
//     marginTop: 2,
//   },

//   clearButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   messagesContainer: {
//     flex: 1,
//   },

//   messagesContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     flexGrow: 1,
//   },

//   messageContainer: {
//     marginBottom: 16,
//   },

//   userMessageContainer: {
//     alignItems: "flex-end",
//   },

//   aiMessageContainer: {
//     alignItems: "flex-start",
//   },

//   messageBubble: {
//     maxWidth: "80%",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 20,
//   },

//   userMessage: {
//     backgroundColor: "rgba(243, 180, 196, 0.8)",
//     borderBottomRightRadius: 8,
//   },

//   aiMessage: {
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     borderBottomLeftRadius: 8,
//   },

//   messageText: {
//     fontSize: 16,
//     lineHeight: 22,
//     fontFamily: "Fredoka",
//   },

//   userMessageText: {
//     color: "rgba(93, 22, 40, 0.9)",
//   },

//   aiMessageText: {
//     color: "rgba(93, 22, 40, 0.8)",
//   },

//   messageTime: {
//     fontSize: 11,
//     marginTop: 4,
//     fontFamily: "Fredoka",
//   },

//   userMessageTime: {
//     color: "rgba(93, 22, 40, 0.6)",
//     textAlign: "right",
//   },

//   aiMessageTime: {
//     color: "rgba(93, 22, 40, 0.5)",
//     textAlign: "left",
//   },

//   loadingContainer: {
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },

//   loadingBubble: {
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 20,
//     borderBottomLeftRadius: 8,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   loadingText: {
//     fontSize: 14,
//     color: "rgba(93, 22, 40, 0.6)",
//     fontFamily: "Fredoka",
//     marginLeft: 8,
//   },

//   inputContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     borderTopWidth: 1,
//     borderTopColor: "rgba(255, 255, 255, 0.2)",
//   },

//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     borderRadius: 25,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },

//   textInput: {
//     flex: 1,
//     fontSize: 16,
//     color: "rgba(93, 22, 40, 0.8)",
//     fontFamily: "Fredoka",
//     maxHeight: 100,
//     paddingVertical: 8,
//     textAlignVertical: "top",
//   },

//   sendButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "rgba(243, 180, 196, 0.8)",
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: 8,
//   },

//   sendButtonDisabled: {
//     backgroundColor: "rgba(243, 180, 196, 0.3)",
//   },
// });

// src/screens/ChatBotScreen.tsx - Updated version
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
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useChatHistory, ChatMessage } from "../contexts/ChatContext"; // ← Import chat context
import { aiService } from "../services/aiServices";

const { height: screenHeight } = Dimensions.get("window");

export default function ChatBotScreen({ navigation }: any) {
  // ← Use chat context instead of local state
  const { messages, addMessage, resetToWelcome } = useChatHistory();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Auto scroll to bottom when keyboard shows
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]); // ← Watch messages from context

  // AI response generator
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log("🤖 Generating AI response for:", userMessage);

      const response = await aiService.generateMoodResponse(
        userMessage,
        user?.name
      );

      console.log("✅ AI response generated");
      return response;
    } catch (error) {
      console.error("❌ AI Error:", error);
      return "I'm having trouble responding right now, but I'm still here to listen. Please try again in a moment. 💙";
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // ← Add message to context instead of local state
    addMessage(userMessage);
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

      // ← Add AI response to context
      addMessage(aiMessage);
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

  // ← Updated clear chat function
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
            resetToWelcome(); // ← Use context function
            console.log("💬 Chat cleared and reset to welcome");
          },
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={[styles.container]}>
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
          <Text style={styles.headerSubtitle}>
            Here to listen & help 💫
          </Text>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Ionicons name="refresh" size={24} color="rgba(93, 22, 40, 0.8)" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: Math.max(keyboardHeight, 100) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

      {/* Input Area - Fixed at bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 45}
      >
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
            },
          ]}
        >
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
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
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
    </View>
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
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 30,
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
    flexGrow: 1,
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
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
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
    textAlignVertical: "top",
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
