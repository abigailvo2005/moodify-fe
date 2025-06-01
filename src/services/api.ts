import axios from "axios";
import { API_BASE_URL, API_BASE_URL_V2 } from '@env';

const BASE_URL = API_BASE_URL;
const BASE_URL_V2 = API_BASE_URL_V2; // For "requests" collection

// import BASE_URL from 'react-native-dotenv';

// In future, when using JWT: set the token in the headers

// Login user by checking if a user exists with the given username and password
export const loginUser = async (username: string, password: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/users`);
    // Filter based on username và password
    const matchedUser = res.data.find(
      (user: any) => user.username === username && user.password === password
    );
    return matchedUser || null;
  } catch (error) {
    return null;
  }
};


// Register a new user
export const registerUser = async (user: any) => {
  try {
    const res = await axios.post(`${BASE_URL}/users`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("User registered:", res.data);
    return res.data;
  } catch (error) {
    console.error("Registration failed:", error);
    return null;
  }
};

// Check if a referral code is valid
export const checkReferralCode = async (referralCode: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/users`, {
      params: { referralCode },
    });
    // Assuming the referral code is valid if we get a user with that code
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0];
    }
    return null;
  } catch (error) {
    //console.error("Checking referral code failed:", error);
    return null;
  }
};

// Get all moods for a specific user
export const getMoods = async (userId: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/mood`, {
      params: { userId },
    });
    return res.data;
  } catch (error) {
    //console.error("Fetching moods failed:", error);
    return [];
  }
};

// Create a new mood for a user
export const createMood = async (mood: any) => {
  try {
    const res = await axios.post(`${BASE_URL}/mood`, mood, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Creating mood failed:", error);
    return null;
  }
};

// Update an existing mood by moodId
export const updateMood = async (moodId: string, mood: any) => {
  try {
    const res = await axios.put(`${BASE_URL}/mood/${moodId}`, mood, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Updating mood failed:", error);
    return null;
  }
};

// Delete a mood by moodId
export const deleteMood = async (moodId: string) => {
  try {
    const res = await axios.delete(`${BASE_URL}/mood/${moodId}`);
    return res.data;
  } catch (error) {
    console.error("Deleting mood failed:", error);
    return null;
  }
};

// Connect with a friend (add friend relationship)
export const connectFriend = async (userId: string, friendId: string) => {
  try {
    // Assuming you have a 'friends' resource in your mockapi
    const res = await axios.post(
      `${BASE_URL}/friends`,
      { userId, friendId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Connecting friend failed:", error);
    return null;
  }
};


// Get mood by moodId
export const getMoodById = async (moodId: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/mood/${moodId}`);
    return res.data;
  } catch (error) {
    console.error("Fetching mood by ID failed:", error);
    return null;
  }
}

// Get all friends of a user
export const getFriends = async (userId: string) => {
  try {
    // Assuming you have a 'friends' resource in your mockapi
    return [];
  } catch (error) {
    console.error("Fetching friends failed:", error);
    return [];
  }
}