# 🌈 Moodify - Mood Tracking App

> A beautiful React Native app for tracking your daily emotions, connecting with friends, and improving mental wellness with AI support.

## 📱 What is Moodify?

Moodify is a comprehensive mood tracking application that helps you:
- **Track daily emotions** with photos, locations, and detailed descriptions
- **Connect with friends** to share and support each other's emotional journey  
- **Visualize moods on a map** to see where emotions happen
- **Chat with an AI companion** for emotional support and insights
- **Maintain privacy** with flexible sharing controls

## ✨ Key Features

### 🎭 **Mood Tracking**
- Log emotions with 7 different mood types (Happy, Sad, Excited, Angry, Neutral, Tired, Scared)
- Add photos to capture the moment
- Include location data to see where moods occur
- Write detailed descriptions and reasons

### 👥 **Social Connection**
- Connect with friends using unique referral codes
- View friends' public moods and locations
- Send and receive friend requests
- Privacy controls for sharing preferences

### 🗺️ **Interactive Mood Map**
- Visualize your moods and friends' moods on a real map
- Beautiful animated mood icons instead of basic pins
- Click on markers to view mood details
- Focus on your latest mood location

### 🤖 **AI Mood Assistant**
- Chat with an empathetic AI companion powered by Google Gemini
- Receive personalized emotional support
- Get gentle suggestions for mood improvement
- Draggable floating chat button for easy access

### 📊 **Mood History**
- Browse all your past moods organized by date
- View friends' public mood histories
- Edit or delete your own mood entries
- Track emotional patterns over time

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Animations**: Lottie React Native
- **Maps**: React Native Maps
- **Backend**: Firebase Firestore / MockAPI
- **Storage**: Supabase (for images)
- **AI**: Google Gemini AI
- **State Management**: React Context

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator or Android Emulator (optional)

### 1. Clone & Install
```bash
git clone <repository-url>
cd moodify
npm install
```

### 2. Environment Setup
Create `.env` file in root directory:
```env
# Basic setup for development
USE_FIREBASE=false
API_BASE_URL=https://6475a9a475e7b6039071c0b6.mockapi.io/api/v1
API_BASE_URL_V2=https://6475a9a475e7b6039071c0b6.mockapi.io/api/v2

# Optional: Add these for full functionality
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Run the App
```bash
npm start
```
- Scan QR code with Expo Go app on your phone
- Press `i` for iOS Simulator or `a` for Android Emulator

## 🎯 How to Use

### Getting Started
1. **Register** a new account with your details
2. **Login** with your credentials
3. Get your unique **referral code** from Profile tab

### Create Your First Mood
1. Tap **"Add New Mood +"** on Home screen
2. Select your current emotion
3. Write how you're feeling
4. Optionally add a photo and location
5. Choose privacy setting and save

### Connect with Friends
1. Go to **Friends** tab
2. Enter a friend's referral code
3. Send connection request
4. Wait for acceptance

### Explore the Map
1. Visit **Map** tab to see mood locations
2. Tap mood markers to view details
3. Use the location button to find your latest mood

### Chat with AI
1. Tap the floating chat button
2. Share your feelings with the AI companion
3. Long-press the button to drag it around

## 🔧 Configuration Options

### Backend Switching
The app supports multiple backend options:
- **MockAPI** (default): For development and testing
- **Firebase**: For production with real-time features
- **Supabase**: Alternative with built-in storage

Change backend by modifying `USE_FIREBASE` in `.env` file.

### Feature Toggles
Certain features require additional setup:
- **AI Chat**: Requires Google Gemini API key
- **Photo Upload**: Requires Supabase configuration  
- **Real-time Updates**: Works with Firebase backend

## 📱 App Screenshots

*Note: Add screenshots here showing:*
- Home screen with mood creation
- Mood map with animated markers
- Chat interface with AI
- Friend connection flow
- Mood history view

## 🤝 Contributing

This app is built for learning and demonstration purposes. Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Use as reference for your own projects

## 📄 License

MIT License - Feel free to use this code for your own projects.

---

**Built with React Native & Expo** 📱✨