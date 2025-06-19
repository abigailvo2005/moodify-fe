// constants/routes.ts
export const ROUTES = {
  HOME: "Home",
  MOODS: "Mood",
  CONNECT_FRIENDS: "Friends",
  PROFILE: "Profile",
  LOGIN: "Login",
  REGISTER: "Register",
  CREATE_MOOD: "CreateMood",
};

export const QUESTIONS = [
  "How are you feeling today?",
  "What's your mood like right now?",
  "Ready to capture your emotions?",
  "How would you describe your day?",
  "What's bringing you joy today?",
];

export const CAROUSEL_ANIMATIONS = [
  require("../../assets/carousel/carousel-1.json"),
  require("../../assets/carousel/carousel-2.json"),
  require("../../assets/carousel/carousel-3.json"),
  require("../../assets/carousel/carousel-4.json"),
];

export const MOOD_ICONS = [
  {
    name: "HAPPY",
    label: "Happy",
    animation: require("../../assets/animations/happy-animation.json"),
  },
  {
    name: "SAD",
    label: "Sad",
    animation: require("../../assets/animations/sad-animation.json"),
  },
  {
    name: "NEUTRAL",
    label: "Neutral",
    animation: require("../../assets/animations/neutral-animation.json"),
  },
  {
    name: "EXCITED",
    label: "Excited",
    animation: require("../../assets/animations/excited-animation.json"),
  },
  {
    name: "ANGRY",
    label: "Angry",
    animation: require("../../assets/animations/angry-animation.json"),
  },
  {
    name: "TIRED",
    label: "Tired",
    animation: require("../../assets/animations/tired-animation.json"),
  },
  {
    name: "SCARED",
    label: "Scared",
    animation: require("../../assets/animations/scared-animation.json"),
  },
];

export const REQUEST_STATUS = {
  Accepted: {
    label: "Accepted",
    icon: "✅",
  },
  Waiting: {
    label: "Waiting",
    icon: "⏳",
  },
  Denied: {
    label: "Denied",
    icon: "❌",
  },
  Unknown: {
    label: "Unknown",
    icon: "❓",
  },
};

// App Knowledge Base
export const APP_KNOWLEDGE = {
  name: "Moodify",
  description:
    "A mood tracking app that helps users understand and manage their emotions",

  features: {
    mood_tracking: {
      description: "Track daily moods with 7 different emotions",
      moods: ["Happy", "Sad", "Neutral", "Excited", "Angry", "Tired", "Scared"],
      details:
        "Users can add descriptions, reasons, photos, and locations to their moods",
    },

    social_features: {
      description: "Connect with friends and share mood journeys",
      features: [
        "Send friend requests using referral codes",
        "View each of your friends' public moods",
        "See latest public friends' mood locations on map",
        "Accept/deny connection requests",
      ],
      limitations: ["Cannot view friend's profile", "Cannot text friends"],
    },

    mood_history: {
      description: "View and manage past moods",
      features: [
        "Browse mood diary by date",
        "Edit or delete existing moods",
        "Filter by different users (self/friends)",
        "Private vs public mood visibility",
      ],
    },

    location_features: {
      description: "Add location context to moods",
      features: [
        "Use current GPS location",
        "Search for specific addresses",
        "Select custom locations on map",
        "View mood map showing where emotions were felt",
      ],
    },

    ai_companion: {
      description: "Chat with AI for emotional support and guidance",
      capabilities: [
        "Provide empathetic responses to feelings",
        "Ask thoughtful follow-up questions",
        "Suggest coping strategies",
        "Help users understand their emotions",
        "Guide users through app features",
      ],
    },

    profile_management: {
      description: "Manage personal information and settings",
      features: [
        "Update name, username, date of birth",
        "Share referral code with friends",
        "View your friend connections",
        "Account privacy settings",
      ],
    },
  },

  navigation: {
    tabs: [
      {
        name: "Home",
        description: "Main dashboard with quick actions and mood creation",
      },
      {
        name: "Moods",
        description: "View mood history and diary entries",
      },
      {
        name: "Map",
        description: "See latest public mood locations on interactive map",
      },
      {
        name: "Friends",
        description: "Manage friend connections and requests",
      },
      {
        name: "Profile",
        description: "Personal settings and account management",
      },
    ],

    actions: [
      {
        name: "Create Mood",
        description: "Add new mood entry with details, photos, and location",
      },
      {
        name: "Chat with AI virtual assistant",
        description: "Get emotional support and app guidance",
      },
      {
        name: "Connect Friends",
        description: "Send requests using referral codes",
      },
      {
        name: "View Mood Details",
        description: "See full information about any mood entry",
      },
    ],
  },

  common_tasks: {
    create_mood:
      "Tap 'Add New Mood +' button → Choose mood type → Add description and reason → Optionally add photo and location → Save My Mood 💕.",
    add_friends:
      "Go to Friends tab → Enter friend's referral code → Send request → Wait for acceptance",
    view_mood_history:
      "Go to Moods tab → Browse by date → Tap any mood to see details",
    share_referral:
      "Go to Profile tab → Copy referral code → Share with friends",
    add_location:
      "When creating mood → Tap 'Add Location' → Choose current location, search address, or select on map",
    change_privacy:
      "When creating/editing mood → Toggle 'Keep this private?' switch",
    view_map:
      "Go to Map tab → See your and friends' mood locations → Tap markers for details",
  },
};

// AI Mock Responses - used when Gemini has problems
export const MOCK_RESPONSE = {
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

  default: [
    "Thank you for sharing with me. Your feelings matter, and I'm here to listen without judgment. By the way, I can also help you navigate Moodify's features - just ask if you need guidance with creating moods, connecting friends, or anything else! 💕",
    "I appreciate you opening up about how you're feeling. There's something brave about putting emotions into words. If you'd like, I can also show you how to track this mood in your diary or help with any app features. What would be most helpful? 🌸",
    "Whatever you're feeling right now is completely valid. Emotions are like weather - they come and go, each one teaching us something. I'm here for emotional support and can also guide you through using Moodify. What do you need most? 🌈",
  ],
};
