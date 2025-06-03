import axios from "axios";
import { API_BASE_URL, API_BASE_URL_V2 } from '@env';
import { ConnectingRequest, User } from "../types";
import { REQUEST_STATUS } from "../constants";

const BASE_URL = API_BASE_URL;
const BASE_URL_V2 = API_BASE_URL_V2; // For "requests" collection


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
    console.log("Registration failed:", error);
    return null;
  }
};

// Update user
export const updateUser = async (userId: string, updatedUser: User) => {
  try {
    const res = await axios.put(`${BASE_URL}/users/${userId}`, updatedUser, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.log("Updating user failed:", error);
    return null;
  }
};

// Check whether username existed or not, skip if it belongs to the same userId (if provided)
export const isUsernameExisted = async (username: string, userId: string | null = null) => {
  try {
    const res = await axios.get(`${BASE_URL}/users`, {
      params: { username },
    });
    if (Array.isArray(res.data) && res.data.length > 0) {
      // If userId is provided, skip if the username belongs to the same user
      if (userId) {
        return res.data.some((user: any) => user.username === username && user.id !== userId);
      }
      // If userId is not provided, any match means username exists
      return true;
    }
    return false;
  } catch (error) {
    return false;
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
    //console.log("Checking referral code failed:", error);
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
    console.log("Fetching moods failed:", error);
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
    console.log("Creating mood failed:", error);
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
    console.log("Updating mood failed:", error);
    return null;
  }
};

// Delete a mood by moodId
export const deleteMood = async (moodId: string) => {
  try {
    const res = await axios.delete(`${BASE_URL}/mood/${moodId}`);
    return res.data;
  } catch (error) {
    console.log("Deleting mood failed:", error);
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
    console.log("Connecting friend failed:", error);
    return null;
  }
};


// Get mood by moodId
export const getMoodById = async (moodId: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/mood/${moodId}`);
    return res.data;
  } catch (error) {
    console.log("Fetching mood by ID failed:", error);
    return null;
  }
}

// Get all friends of a user
export const getFriends = async (userId: string) => {
  try {
    // Assuming you have a 'friends' resource in your mockapi
    return [];
  } catch (error) {
    console.log("Fetching friends failed:", error);
    return [];
  }
}

// Check if there's already a pending request between these users
export const hasPendingRequest = async (userAId: string, userBId: string) => {
  try {
    const res = await axios.get(`${BASE_URL_V2}/requests`, {
      params: {
        status: REQUEST_STATUS.Waiting.label,
      },
    });
    if (!Array.isArray(res.data)) return false;
    // Check for both 
    return res.data.some(
      (req: any) =>
        ((req.senderId === userAId && req.receiverId === userBId) ||
         (req.senderId === userBId && req.receiverId === userAId)) &&
        req.status === REQUEST_STATUS.Waiting.label
    );
  } catch (error) {
    console.log("Checking pending request failed:", error);
    return false;
  }
};

// Get User by UserId
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/users/${userId}`);
    return res.data;
  } catch (error) {
    console.log("Fetching user by ID failed:", error);
    return null;
  }
};

// Get user by Referral Code
export const getUserByReferralCode = async (referralCode: string): Promise<User | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/users`, {
      params: { referralCode },
    });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0];
    }
    return null;
  } catch (error) {
    console.log("Fetching user by referral code failed:", error);
    return null;
  }
};

// Create connecting request
export const createConnectingRequest = async (request : ConnectingRequest) => {
  try {
    const res = await axios.post(`${BASE_URL_V2}/requests`, request, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.log("Creating connecting request failed:", error);
    return null;
  }
};

// get incoming requests for a User
export const getIncomingRequests = async (userId: string) => {
  try {
    const res = await axios.get(`${BASE_URL_V2}/requests`, {
      params: { receiverId: userId }
    });
    return res.data;
  } catch (error) {
    console.log("Fetching incoming requests failed:", error);
    return [];
  }
};

// get sent requests for a User
export const getSentRequests = async (userId: string) => {
  try {
    const res = await axios.get(`${BASE_URL_V2}/requests`, {
      params: { senderId: userId }
    });
    return res.data;
  } catch (error) {
    console.log("Fetching sent requests failed:", error);
    return [];
  }
};

// get list of users based on list of requests
export const getUsersFromRequests = async (
  requests: any[],
  type: "sender" | "receiver" = "sender"
): Promise<User[]> => {
  try {
    const userIds = Array.from(
      new Set(
        requests
          .map(req => type === "sender" ? req.senderId : req.receiverId)
          .filter(Boolean)
      )
    );
    console.log(userIds);
    console.log(requests);
    const userPromises = userIds.map(id => axios.get(`${BASE_URL}/users/${id}`));
    const userResponses = await Promise.all(userPromises);
    return userResponses.map(res => res.data);
  } catch (error) {
    console.log("Fetching users from requests failed:", error);
    return [];
  }
};

/**
 * Accept a connecting request 
 */
export const acceptRequest = async (requestId: string) => {
  try {
    const res = await axios.patch(`${BASE_URL_V2}/requests/${requestId}`, {
      status: REQUEST_STATUS.Accepted.label, // Accepted
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.log("Approving request failed:", error);
    return null;
  }
};

/**
 * Deny a connecting request 
 */
export const denyRequest = async (requestId: string) => {
  try {
    const res = await axios.patch(`${BASE_URL_V2}/requests/${requestId}`, {
      status: REQUEST_STATUS.Denied.label, // Denied
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.log("Denying request failed:", error);
    return null;
  }
};

// Create new friends connection when a request is already handled as accepted
export const addFriendsByRequestId = async (requestId: string) => {
  try {
    // Get the request details
    const requestRes = await axios.get(`${BASE_URL_V2}/requests/${requestId}`);
    const { senderId, receiverId } = requestRes.data;

    // Get both users
    const [senderRes, receiverRes] = await Promise.all([
      axios.get(`${BASE_URL}/users/${senderId}`),
      axios.get(`${BASE_URL}/users/${receiverId}`)
    ]);
    const sender = senderRes.data;
    const receiver = receiverRes.data;

    // Update friends arrays (avoid duplicates)
    const updatedSenderFriends = Array.isArray(sender.friends)
      ? Array.from(new Set([...sender.friends, receiverId]))
      : [receiverId];
    const updatedReceiverFriends = Array.isArray(receiver.friends)
      ? Array.from(new Set([...receiver.friends, senderId]))
      : [senderId];

    // Update users in DB
    await Promise.all([
      axios.put(`${BASE_URL}/users/${senderId}`, { ...sender, friends: updatedSenderFriends }, {
        headers: { "Content-Type": "application/json" }
      }),
      axios.put(`${BASE_URL}/users/${receiverId}`, { ...receiver, friends: updatedReceiverFriends }, {
        headers: { "Content-Type": "application/json" }
      })
    ]);

    return true;
  } catch (error) {
    console.log("Adding friends by requestId failed:", error);
    return false;
  }
};


// Resending a denied request
export const resendDeniedRequest = async (requestId: string) => {
  try {
    // Get the request details
    const res = await axios.get(`${BASE_URL_V2}/requests/${requestId}`);
    const request = res.data;

    // Check if the request is denied
    if (request.status !== REQUEST_STATUS.Denied.label) {
      throw new Error("Request is not in denied status.");
    }

    // Update the request status to pending
    const updateRes = await axios.patch(
      `${BASE_URL_V2}/requests/${requestId}`,
      { status: REQUEST_STATUS.Waiting.label }, // Pending
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return updateRes.data;
  } catch (error) {
    console.log("Resending denied request failed:", error);
    return null;
  }
};

// Delete a request if user changes their mind
export const deleteRequest = async (requestId: string) => {
  try {
    // Get the request details first
    const res = await axios.get(`${BASE_URL_V2}/requests/${requestId}`);
    const request = res.data;

    // Only allow delete if status is "Waiting"
    if (request.status !== REQUEST_STATUS.Waiting.label) {
      throw new Error("Only requests with 'Waiting' status can be deleted.");
    }

    const deleteRes = await axios.delete(`${BASE_URL_V2}/requests/${requestId}`);
    return deleteRes.data;
  } catch (error) {
    console.log("Deleting request failed:", error);
    return null;
  }
};

/**
 * Get a list of users by an array of userIds (list of friends)
 */
export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  try {
    const uniqueIds = Array.from(new Set(userIds)).filter(Boolean);
    const userPromises = uniqueIds.map(id => axios.get(`${BASE_URL}/users/${id}`));
    const userResponses = await Promise.all(userPromises);
    return userResponses.map(res => res.data);
  } catch (error) {
    console.log("Fetching users by IDs failed:", error);
    return [];
  }
};