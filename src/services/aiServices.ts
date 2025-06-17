import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXPO_PUBLIC_GOOGLE_AI_API_KEY } from "@env";

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    this.initializeAI();
  }

  private initializeAI() {
    try {
      // Try to get API key from Constants (expo config)
      let apiKey = EXPO_PUBLIC_GOOGLE_AI_API_KEY;

      // Fallback to environment variable
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
      // Trong method initializeAI(), thay đổi dòng này:
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // 👈 Thay đổi ở đây
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
    if (!this.model) {
      console.log("🔄 Using mock response (AI not available)");
      return this.getMockResponse(userMessage);
    }

    try {
      console.log("🤖 Generating AI response...");

      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Keep only recent history (last 10 messages)
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

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: text.trim(),
      });

      console.log("✅ AI response generated successfully");
      return text.trim();
    } catch (error) {
      console.error("❌ AI Service Error:", error);

      // Check if it's a quota/rate limit error
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

      // Fallback to mock response for any other error
      return this.getMockResponse(userMessage);
    }
  }

  private createMoodPrompt(userMessage: string, userName?: string): string {
    const namePrefix = userName ? `${userName}, ` : "";

    // Get recent conversation context
    const recentContext = this.conversationHistory
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const contextPrefix = recentContext
      ? `Recent conversation:\n${recentContext}\n\n`
      : "";

    return `${contextPrefix}You are a caring, empathetic AI mood companion in a mood tracking app. Your role is to:

🎯 PRIMARY GOALS:
- Listen actively and validate emotions without judgment
- Provide warm, supportive responses that feel genuinely caring
- Ask thoughtful follow-up questions to encourage self-reflection
- Suggest gentle, practical coping strategies when appropriate
- Help users understand their emotions better

💬 RESPONSE STYLE:
- Keep responses between 50-100 words (conversational length)
- Use a warm, friend-like tone (not clinical or overly formal)
- Include appropriate emojis sparingly (1-2 per response)
- Ask ONE engaging follow-up question when relevant
- Avoid giving medical advice or therapy

🌱 EMOTIONAL SUPPORT APPROACH:
- Acknowledge and normalize their feelings first
- Show genuine curiosity about their experience
- Offer perspective without dismissing their emotions
- Suggest small, manageable self-care actions
- Celebrate positive moments and progress

Current user message: "${userMessage}"

Please respond as a compassionate friend who genuinely cares about their emotional wellbeing. ${namePrefix}remember that sometimes the most powerful thing is simply being heard and understood.`;
  }

  private getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Enhanced mock responses with more variety
    const responses = {
      sad: [
        "I'm sorry you're feeling sad. Your feelings are completely valid, and it's okay to feel this way. Would you like to talk about what's weighing on your heart right now? Sometimes sharing can help lighten the emotional load. 💙",
        "It sounds like you're going through a tough time. Sadness is such a deeply human emotion, and it shows how much you care. What's one small thing that usually brings you even a tiny bit of comfort? 🌙",
        "I hear the sadness in your words, and I want you to know that you're not alone. These heavy feelings will pass, even though they feel overwhelming right now. How can I best support you today? 💜",
      ],

      happy: [
        "I'm so glad to hear you're feeling happy! It's wonderful when we experience those bright moments. What's bringing you joy today? I'd love to celebrate this positive energy with you! ✨",
        "Your happiness is contagious - I can feel the positive energy in your message! These beautiful moments are so precious. What made today special for you? 😊",
        "How wonderful that you're feeling happy! It's important to savor these golden moments. What's contributing to this lovely mood of yours? 🌟",
      ],

      angry: [
        "I can sense your frustration, and that's completely understandable. Anger often tells us that something important needs our attention. Would you like to explore what's behind these feelings? Sometimes understanding the 'why' can help us move forward. 🌿",
        "It sounds like something really got under your skin. Anger can be such a powerful emotion - it's your inner voice saying something matters to you. What's stirring up these intense feelings? 🔥",
        "I hear the frustration in your words. Anger is often a signal that our boundaries or values have been crossed. Take a deep breath with me - what's really at the heart of this feeling? 💨",
      ],

      anxious: [
        "Anxiety can feel overwhelming, but please know you're not alone in this. Right now, try to focus on your breathing - in for 4, hold for 4, out for 4. What's one small thing around you that brings you even a tiny bit of calm? 🕊️",
        "I can feel the worry in your message. Anxiety has a way of making everything feel urgent and scary. You're safe right now in this moment. What's your mind focusing on that's causing this unease? 🌊",
        "Those anxious feelings are so tough to carry. Your nervous system is trying to protect you, even though it might feel overwhelming. What's been weighing on your mind lately? 🫧",
      ],

      tired: [
        "Feeling tired can really affect our whole mood and perspective. Are you getting enough rest, or is this more of an emotional exhaustion? Sometimes our hearts get tired too, and that's completely valid. What would help you recharge today? 💤",
        "Exhaustion is your body and mind's way of asking for care. Whether it's physical or emotional tiredness, it deserves attention. What's been draining your energy lately? 🌙",
        "I hear how drained you're feeling. Being tired - whether physically, emotionally, or mentally - is a signal to slow down and be gentle with yourself. What kind of rest do you need most right now? ✨",
      ],

      stressed: [
        "Stress can feel like carrying the weight of the world. Take a moment to breathe with me. What's the biggest thing on your plate right now that's creating this pressure? 🌪️",
        "I can sense the tension you're feeling. Stress often comes from juggling too many things at once. Let's break it down - what's feeling most overwhelming today? 🌿",
        "That stressed feeling is so draining. Your mind is probably racing with everything you need to handle. What's one thing we could tackle together to lighten that load? 💆‍♀️",
      ],

      grateful: [
        "Gratitude is such a beautiful emotion - it's like sunshine for the soul. I love that you're taking time to appreciate the good things. What's filling your heart with thankfulness today? 🌻",
        "There's something magical about feeling grateful. It shifts our whole perspective, doesn't it? What wonderful thing happened that sparked this appreciation? ✨",
        "Gratitude is one of my favorite emotions to witness. It shows how you're finding light even in ordinary moments. What's making you feel especially thankful? 🙏",
      ],

      confused: [
        "Feeling confused can be really unsettling - like being in a fog where nothing seems clear. That's such a human experience though. What's got your mind all tangled up? 🌫️",
        "Confusion often means we're processing something complex or new. It's okay not to have all the answers right now. What's the main thing that's feeling unclear to you? 🤔",
        "When everything feels jumbled, it can be overwhelming. Take it one piece at a time. What's the biggest question mark in your mind today? 🧩",
      ],

      lonely: [
        "Loneliness can feel so heavy, like being surrounded by silence. I want you to know that you're not truly alone - I'm here with you right now. What's making you feel most disconnected? 🤗",
        "That lonely feeling is so difficult to sit with. Sometimes we can feel alone even when people are around. What kind of connection are you missing most? 💙",
        "Loneliness is one of the hardest emotions to carry. You're reaching out though, and that takes courage. What would feeling more connected look like for you? 🌉",
      ],

      excited: [
        "I can feel your excitement through your words! That energy is absolutely infectious. What's got you feeling so pumped up? I want to celebrate with you! 🎉",
        "Your excitement is wonderful - like sparkles of joy! These moments of anticipation and energy are so precious. What's creating all this amazing buzz? ⚡",
        "Excitement is such a delicious emotion! It's like your whole being is lighting up. Tell me what's got you feeling so wonderfully energized! 🌟",
      ],

      default: [
        "Thank you for sharing with me. Your feelings matter, and I'm here to listen without judgment. Every emotion you experience is part of your unique human journey. What would feel most supportive for you right now? 💕",
        "I appreciate you opening up about how you're feeling. There's something brave about putting emotions into words. What's the most important thing you want me to understand about what you're going through? 🌸",
        "Whatever you're feeling right now is completely valid. Emotions are like weather - they come and go, each one teaching us something. How can I best support you in this moment? 🌈",
        "Thank you for trusting me with your feelings. Every emotion - comfortable or uncomfortable - has something to tell us. What's your heart trying to communicate to you today? 💝",
      ],
    };

    // Enhanced keyword matching with multiple categories
    type MoodCategory =
      | "sad"
      | "happy"
      | "angry"
      | "anxious"
      | "tired"
      | "stressed"
      | "grateful"
      | "confused"
      | "lonely"
      | "excited"
      | "default";
    const getResponses = (category: MoodCategory) => {
      const categoryResponses = responses[category];
      return categoryResponses[
        Math.floor(Math.random() * categoryResponses.length)
      ];
    };

    // Sadness
    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("down") ||
      lowerMessage.includes("depressed") ||
      lowerMessage.includes("cry") ||
      lowerMessage.includes("hurt")
    ) {
      return getResponses("sad");
    }

    // Happiness
    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great") ||
      lowerMessage.includes("amazing") ||
      lowerMessage.includes("wonderful") ||
      lowerMessage.includes("awesome")
    ) {
      return getResponses("happy");
    }

    // Anger
    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("mad") ||
      lowerMessage.includes("frustrated") ||
      lowerMessage.includes("annoyed") ||
      lowerMessage.includes("furious")
    ) {
      return getResponses("angry");
    }

    // Anxiety
    if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worried") ||
      lowerMessage.includes("stress") ||
      lowerMessage.includes("nervous") ||
      lowerMessage.includes("panic")
    ) {
      return getResponses("anxious");
    }

    // Tiredness
    if (
      lowerMessage.includes("tired") ||
      lowerMessage.includes("exhausted") ||
      lowerMessage.includes("drained") ||
      lowerMessage.includes("sleepy") ||
      lowerMessage.includes("worn out")
    ) {
      return getResponses("tired");
    }

    // Stress (separate from anxiety)
    if (
      lowerMessage.includes("stress") ||
      lowerMessage.includes("pressure") ||
      lowerMessage.includes("overwhelm") ||
      lowerMessage.includes("busy")
    ) {
      return getResponses("stressed");
    }

    // Gratitude
    if (
      lowerMessage.includes("grateful") ||
      lowerMessage.includes("thankful") ||
      lowerMessage.includes("appreciate") ||
      lowerMessage.includes("blessed")
    ) {
      return getResponses("grateful");
    }

    // Confusion
    if (
      lowerMessage.includes("confused") ||
      lowerMessage.includes("lost") ||
      lowerMessage.includes("unclear") ||
      lowerMessage.includes("don't understand")
    ) {
      return getResponses("confused");
    }

    // Loneliness
    if (
      lowerMessage.includes("lonely") ||
      lowerMessage.includes("alone") ||
      lowerMessage.includes("isolated") ||
      lowerMessage.includes("disconnected")
    ) {
      return getResponses("lonely");
    }

    // Excitement
    if (
      lowerMessage.includes("excited") ||
      lowerMessage.includes("thrilled") ||
      lowerMessage.includes("pumped") ||
      lowerMessage.includes("can't wait")
    ) {
      return getResponses("excited");
    }

    // Default responses
    return getResponses("default");
  }

  // Method to clear conversation history (for privacy)
  clearConversationHistory(): void {
    this.conversationHistory = [];
    console.log("🧹 Conversation history cleared");
  }

  // Method to check if AI is available
  isAIAvailable(): boolean {
    return this.model !== null;
  }

  // Method to get AI status for debugging
  getAIStatus(): { available: boolean; provider: string } {
    return {
      available: this.isAIAvailable(),
      provider: this.isAIAvailable() ? "Google Gemini" : "Mock Responses",
    };
  }
}

export const aiService = new AIService();
