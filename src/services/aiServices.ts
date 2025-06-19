import { EXPO_PUBLIC_GOOGLE_AI_API_KEY } from "@env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { APP_KNOWLEDGE, MOCK_RESPONSE } from "../constants";

// Intent Detection
const detectAppIntent = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();

  // App guidance intents
  if (
    lowerMessage.includes("how to") ||
    lowerMessage.includes("how do i") ||
    lowerMessage.includes("how can i")
  ) {
    if (lowerMessage.includes("mood")) return "create_mood_help";
    if (lowerMessage.includes("friend")) return "friends_help";
    if (lowerMessage.includes("location")) return "location_help";
    if (lowerMessage.includes("map")) return "map_help";
    return "general_help";
  }

  // Feature questions
  if (
    lowerMessage.includes("what is") ||
    lowerMessage.includes("what does") ||
    lowerMessage.includes("explain")
  ) {
    if (lowerMessage.includes("moodify") || lowerMessage.includes("app"))
      return "app_explanation";
    if (lowerMessage.includes("referral")) return "referral_explanation";
    if (lowerMessage.includes("private") || lowerMessage.includes("public"))
      return "privacy_explanation";
    return "feature_explanation";
  }

  // Navigation help
  if (lowerMessage.includes("where") || lowerMessage.includes("find")) {
    if (lowerMessage.includes("mood") || lowerMessage.includes("diary"))
      return "navigation_moods";
    if (lowerMessage.includes("friend")) return "navigation_friends";
    if (lowerMessage.includes("profile")) return "navigation_profile";
    if (lowerMessage.includes("map")) return "navigation_map";
    return "navigation_help";
  }

  // Troubleshooting
  if (
    lowerMessage.includes("not working") ||
    lowerMessage.includes("error") ||
    lowerMessage.includes("problem")
  ) {
    return "troubleshooting";
  }

  // App-specific keywords
  if (
    lowerMessage.includes("moodify") ||
    lowerMessage.includes("referral code") ||
    lowerMessage.includes("mood diary") ||
    lowerMessage.includes("mood map")
  ) {
    return "app_specific";
  }

  return null; // Not app-related, continue with normal emotional support
};

// ← Generate app-specific responses
const generateAppResponse = (
  intent: string,
  originalMessage: string
): string => {
  const responses: { [key: string]: string } = {
    app_explanation: `Moodify is your personal mood tracking companion! 💫 I help you:

• Track emotions with 7 different moods (Happy, Sad, Excited, etc.)
• Add context with photos, locations, and detailed descriptions  
• Connect with friends to share your emotional journey
• View mood patterns on your personal diary and map
• Get AI support for understanding and managing your feelings

What would you like to explore first? I can guide you through any feature! 🌟`,

    create_mood_help: `Creating a mood is easy! Here's how: 📝

1. Tap the "Add New Mood +" button (on Home screen or Moods tab)
2. Choose your current emotion from 7 options 
3. Describe what you're feeling - be as detailed as you like
4. Add the reason - what caused this mood?
5. Optional extras:
   • 📸 Add a photo to capture the moment
   • 📍 Add your location (current, search, or map)
   • 🔒 Toggle privacy (private = only you see it)
6. Tap "Save My Mood" 

Your mood is now saved in your personal diary! Want me to walk you through any specific part? 💕`,

    friends_help: `Connecting with friends makes mood tracking more meaningful! Here's how: 👥

To add friends:
1. Go to Friends tab 
2. Get your friend's referral code (they find it in Profile tab)
3. Enter their code and tap "Connect 💕"
4. Wait for them to accept your request

To share your code:
1. Go to Profile tab
2. Find your unique referral code 
3. Tap "Copy" and share it with friends

Managing requests:
• Incoming tab - Accept/deny requests from others
• Sent tab - See your pending requests

Once connected, you can see their public moods on the map and in their diary! 🗺️✨`,

    location_help: `Adding location to your moods helps track where you feel different emotions! 📍

3 ways to add location:

1. 📱 Current Location
   • Tap "Add Location" → "Current Location"  
   • App will use your GPS coordinates

2. 🔍 Search Address *(New feature!)*
   • Tap "Add Location" → "Search Address"
   • Type any place name or address
   • Select from dropdown suggestions

3. 🗺️ Select on Map
   • Tap "Add Location" → "Select on Map" 
   • Tap anywhere on the map to pin location

Note: The app will ask for location permission first. This helps create your personal mood map! 🌟`,

    map_help: `The Mood Map shows where you and your friends felt different emotions! 🗺️

Features:
• Colored pins show different mood types
• Your moods vs friends' public moods
• Tap any pin to see mood details
• Auto-focus on your latest mood location

Navigation:
• 🔄 Refresh button - Reload all mood locations  
• ❓ Legend button - See what each color means
• 📍 Focus button - Center on your latest mood (if you have one)

Privacy: Only public moods appear on friends' maps. Your private moods only show on your own map! 🔒

Want to add your first mood with location? 💫`,

    navigation_help: `Here's how to navigate Moodify: 🧭

Bottom tabs:
• 🏠 Home - Main dashboard, create new moods
• ❤️ Moods - Your mood diary and history  
• 🗺️ Map - See mood locations on map
• 👥 Friends - Connect and manage friends
• 👤 Profile - Your settings and referral code

Quick actions:
• 💬 Chat bubble (floating) - Talk to me anytime!
• + Add Mood buttons - Create new mood entries
• Back arrows - Return to previous screens

Where would you like to go? I can guide you step by step! 🌟`,

    privacy_explanation: `Moodify gives you full control over your privacy! 🔒

Private moods:
• Only YOU can see them
• Won't appear on friends' mood maps
• Hidden from friends' view of your diary

Public moods:  
• Friends can see them in your diary
• The latest one will appear on the shared mood map
• Help friends understand your journey

How to set privacy:
• When creating/editing moods, toggle "Keep this private?"
• Default is public to encourage sharing and support

Your data: All moods (private/public) stay on your device and our secure servers. We never share personal information! 

Need help adjusting privacy on existing moods? 💫`,

    referral_explanation: `Referral codes help you connect safely with friends! 💎

What it is:
• A unique code generated just for you
• Found in your Profile tab
• Like a "friend invite code"

How it works:
1. Share your code with people you want to connect with
2. They enter your code in their Friends tab  
3. You get a connection request to accept/deny
4. Once accepted - you're mood buddies! 

Why referral codes?
• Privacy - Only people you give your code to can find you
• Control - You decide who to accept  
• Safety - No random people can see your moods

Your code is: Check your Profile tab! Want me to guide you there? 🌟`,

    troubleshooting: `I'm here to help fix any issues! 🔧

Common solutions:

Location not working?
• Check if you allowed location permission
• Try restarting the app
• Make sure GPS is enabled on your device

Can't connect to friends? 
• Double-check the referral code (case-sensitive)
• Make sure you both have internet connection
• Try refreshing the Friends tab

Moods not saving?
• Check your internet connection
• Make sure you filled required fields (mood + description)
• Try closing and reopening the app

App running slowly?
• Close other apps to free memory
• Restart your device if needed

What specific problem are you experiencing? I can provide more targeted help! 💕`,

    general_help: `I'm here to help you with anything about Moodify! 🌟

Popular questions:
• "How do I create my first mood?"
• "How do I add friends?"  
• "How does the mood map work?"
• "How do I add photos to moods?"
• "What's a referral code?"

Or try asking:
• "Show me around the app"
• "How do I change privacy settings?"
• "Where do I find my mood history?"

I can also provide emotional support and help you understand your feelings. What would you like to know? 💫`,

    app_specific: `Yes, I know all about Moodify! I'm built right into the app to help you. 💫

I can help with:
• Using app features - step-by-step guidance
• Emotional support - understanding your feelings  
• Troubleshooting - fixing any issues
• Best practices - getting the most from mood tracking

What specifically would you like help with? Just ask naturally - I understand both emotions and app features! 🌟`,
  };

  return responses[intent] || responses.general_help;
};

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    this.initializeAI();
  }

  private initializeAI() {
    try {
      let apiKey = EXPO_PUBLIC_GOOGLE_AI_API_KEY;

      if (!apiKey && process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY) {
        apiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
      }

      if (!apiKey) {
        console.warn("🤖 Google AI API key not found. Using mock responses.");
        console.warn("💡 Set EXPO_PUBLIC_GOOGLE_AI_API_KEY in your .env file");
        return;
      }

      console.log("🔑 Google AI API key loaded successfully");

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
      });

      console.log("🤖 Google AI model initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Google AI:", error);
      this.genAI = null;
      this.model = null;
    }
  }

  async generateMoodResponse(
    userMessage: string,
    userName?: string
  ): Promise<string> {
    // ← Check if this is an app-related question first
    const appIntent = detectAppIntent(userMessage);

    if (appIntent) {
      console.log("🎯 Detected app intent:", appIntent);
      return generateAppResponse(appIntent, userMessage);
    }

    // Continue with normal emotional support if not app-related
    if (!this.model) {
      console.log("🔄 Using mock response (AI not available)");
      return this.getMockResponse(userMessage);
    }

    try {
      console.log("🤖 Generating AI response...");

      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const prompt = this.createMoodPrompt(userMessage, userName);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from AI");
      }

      this.conversationHistory.push({
        role: "assistant",
        content: text.trim(),
      });

      console.log("✅ AI response generated successfully");
      return text.trim();
    } catch (error) {
      console.error("❌ AI Service Error:", error);

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string" &&
        (error.message.includes("quota") || error.message.includes("rate"))
      ) {
        return (
          "I'm experiencing high demand right now. Let me give you a thoughtful response: " +
          this.getMockResponse(userMessage)
        );
      }

      return this.getMockResponse(userMessage);
    }
  }

  private createMoodPrompt(userMessage: string, userName?: string): string {
    const namePrefix = userName ? `${userName}, ` : "";

    const recentContext = this.conversationHistory
      .slice(-6)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const contextPrefix = recentContext
      ? `Recent conversation:\n${recentContext}\n\n`
      : "";

    // ← Include app context in AI prompt
    return `${contextPrefix}You are the AI companion built into Moodify, a mood tracking app. You have two main roles:

🎯 PRIMARY ROLES:
1. Emotional Support Companion: Listen actively, validate emotions, provide empathetic responses, ask thoughtful questions, suggest coping strategies
2. App Guide & Assistant: Help users understand and use Moodify's features effectively

📱 APP CONTEXT - You know about Moodify:
${JSON.stringify(APP_KNOWLEDGE, null, 2)}

💬 RESPONSE GUIDELINES:
- Keep responses 50-100 words for emotional support, longer for app guidance when needed
- Try to include user's name in response for a mutual bonding experience
- Use warm, friend-like tone (not clinical)
- Include appropriate emojis (1-2 per response)
- For app questions: Provide clear, step-by-step instructions
- For emotional support: Focus on validation and gentle guidance
- Ask ONE engaging follow-up question when relevant

🔍 CONTEXT AWARENESS:
- If user asks about app features, provide specific Moodify guidance
- If user shares emotions, focus on emotional support
- You can reference previous conversations and their mood patterns
- Help users connect app features to their emotional wellbeing

Current user message: "${userMessage}"

${namePrefix} respond as both a caring emotional companion AND knowledgeable app assistant. Help them with whatever they need most right now.`;
  }

  private getMockResponse(userMessage: string): string {
    // ← Check for app intents in mock responses too
    const appIntent = detectAppIntent(userMessage);

    if (appIntent) {
      return generateAppResponse(appIntent, userMessage);
    }

    // Continue with existing emotional mock responses
    const lowerMessage = userMessage.toLowerCase();

    const responses = MOCK_RESPONSE;

    // Use existing emotion detection logic
    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("down") ||
      lowerMessage.includes("depressed")
    ) {
      return responses.sad[Math.floor(Math.random() * responses.sad.length)];
    }

    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great")
    ) {
      return responses.happy[
        Math.floor(Math.random() * responses.happy.length)
      ];
    }

    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("mad") ||
      lowerMessage.includes("frustrated")
    ) {
      return responses.angry[
        Math.floor(Math.random() * responses.angry.length)
      ];
    }

    return responses.default[
      Math.floor(Math.random() * responses.default.length)
    ];
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
    console.log("🧹 Conversation history cleared");
  }

  isAIAvailable(): boolean {
    return this.model !== null;
  }

  getAIStatus(): { available: boolean; provider: string } {
    return {
      available: this.isAIAvailable(),
      provider: this.isAIAvailable() ? "Google Gemini" : "Mock Responses",
    };
  }

  // ← Get app knowledge for debugging
  getAppKnowledge() {
    return APP_KNOWLEDGE;
  }

  // ← Test app intent detection
  testAppIntent(message: string) {
    return detectAppIntent(message);
  }
}

export const aiService = new AIService();
