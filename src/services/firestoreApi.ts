// src/services/firestoreApi.ts
import { firestoreService } from "./firestoreService";
import { COLLECTIONS } from "../services/firebase";
import { ConnectingRequest, User } from "../types";
import { REQUEST_STATUS } from "../constants";

// ========== USER OPERATIONS ==========

// Login user by checking if a user exists with the given username and password
export const loginUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const users = await firestoreService.queryWhere<User>(COLLECTIONS.USERS, [
      { field: "username", operator: "==", value: username },
      { field: "password", operator: "==", value: password },
    ]);

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.log("Login failed:", error);
    return null;
  }
};

// Register a new user
export const registerUser = async (
  user: Omit<User, "id">
): Promise<User | null> => {
  try {
    const newUser = await firestoreService.create<User>(
      COLLECTIONS.USERS,
      user
    );
    console.log("User registered:", newUser);
    return newUser;
  } catch (error) {
    console.log("Registration failed:", error);
    return null;
  }
};

// Update user
export const updateUser = async (
  userId: string,
  updatedUser: Partial<User>
): Promise<User | null> => {
  try {
    const updated = await firestoreService.update<User>(
      COLLECTIONS.USERS,
      userId,
      updatedUser
    );
    return updated;
  } catch (error) {
    console.log("Updating user failed:", error);
    return null;
  }
};

// Check whether username existed or not, skip if it belongs to the same userId (if provided)
export const isUsernameExisted = async (
  username: string,
  userId: string | null = null
): Promise<boolean> => {
  try {
    const users = await firestoreService.queryWhere<User>(COLLECTIONS.USERS, [
      { field: "username", operator: "==", value: username },
    ]);

    console.log(userId);

    if (users.length > 0) {
      // If userId is provided, skip if the username belongs to the same user
      if (userId) {
        return users.some(
          (user) => user.username === username && user.id !== userId
        );
      }

      return true;
    }
    return false;
  } catch (error) {
    console.log("Check username existence failed:", error);
    return false;
  }
};

// Check if a referral code is valid
export const checkReferralCode = async (
  referralCode: string
): Promise<User | null> => {
  try {
    const users = await firestoreService.queryWhere<User>(COLLECTIONS.USERS, [
      { field: "referralCode", operator: "==", value: referralCode },
    ]);

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.log("Checking referral code failed:", error);
    return null;
  }
};

// Get User by UserId
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    return await firestoreService.getById<User>(COLLECTIONS.USERS, userId);
  } catch (error) {
    console.log("Fetching user by ID failed:", error);
    return null;
  }
};

// Get user by Referral Code
export const getUserByReferralCode = async (
  referralCode: string
): Promise<User | null> => {
  try {
    return await checkReferralCode(referralCode);
  } catch (error) {
    console.log("Fetching user by referral code failed:", error);
    return null;
  }
};

// Get a list of users by an array of userIds (list of friends)
export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  try {
    const uniqueIds = Array.from(new Set(userIds)).filter(Boolean);
    const users = await Promise.all(
      uniqueIds.map((id) =>
        firestoreService.getById<User>(COLLECTIONS.USERS, id)
      )
    );

    return users.filter((user) => user !== null) as User[];
  } catch (error) {
    console.log("Fetching users by IDs failed:", error);
    return [];
  }
};

// ========== MOOD OPERATIONS ==========

// Get all moods for a specific user
export const getMoods = async (userId: string): Promise<any[]> => {
  try {
    return await firestoreService.queryWhere(COLLECTIONS.MOODS, [
      { field: "userId", operator: "==", value: userId },
    ]);
  } catch (error) {
    console.log("Fetching moods failed:", error);
    return [];
  }
};

// Create a new mood for a user
export const createMood = async (mood: any): Promise<any | null> => {
  try {
    const newMood = await firestoreService.create(COLLECTIONS.MOODS, mood);
    return newMood;
  } catch (error) {
    console.log("Creating mood failed:", error);
    return null;
  }
};

// Update an existing mood by moodId
export const updateMood = async (
  moodId: string,
  mood: any
): Promise<any | null> => {
  try {
    const updated = await firestoreService.update(
      COLLECTIONS.MOODS,
      moodId,
      mood
    );
    return updated;
  } catch (error) {
    console.log("Updating mood failed:", error);
    return null;
  }
};

// Delete a mood by moodId
export const deleteMood = async (moodId: string): Promise<boolean> => {
  try {
    await firestoreService.delete(COLLECTIONS.MOODS, moodId);
    return true;
  } catch (error) {
    console.log("Deleting mood failed:", error);
    return false;
  }
};

// Get mood by moodId
export const getMoodById = async (moodId: string): Promise<any | null> => {
  try {
    console.log("moodId in API: " + moodId);
    console.log(await firestoreService.getById(COLLECTIONS.MOODS, moodId));
    return await firestoreService.getById(COLLECTIONS.MOODS, moodId);
  } catch (error) {
    console.log("Fetching mood by ID failed:", error);
    return null;
  }
};

// ========== FRIEND OPERATIONS ==========

// Connect with a friend (add friend relationship) - DEPRECATED, use requests instead
export const connectFriend = async (
  userId: string,
  friendId: string
): Promise<any | null> => {
  console.warn("connectFriend is deprecated, use connecting requests instead");
  return null;
};

// Get all friends of a user
export const getFriends = async (userId: string): Promise<User[]> => {
  try {
    const user = await getUserById(userId);
    if (!user || !user.friends || !Array.isArray(user.friends)) {
      return [];
    }

    return await getUsersByIds(user.friends);
  } catch (error) {
    console.log("Fetching friends failed:", error);
    return [];
  }
};

// ========== CONNECTING REQUEST OPERATIONS ==========

// Check if there's already a pending request between these users
export const hasPendingRequest = async (
  userAId: string,
  userBId: string
): Promise<boolean> => {
  try {
    const requests = await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [{ field: "status", operator: "==", value: REQUEST_STATUS.Waiting.label }]
    );

    // Check for both directions
    return requests.some(
      (req) =>
        ((req.senderId === userAId && req.receiverId === userBId) ||
          (req.senderId === userBId && req.receiverId === userAId)) &&
        req.status === REQUEST_STATUS.Waiting.label
    );
  } catch (error) {
    console.log("Checking pending request failed:", error);
    return false;
  }
};

// Create connecting request
export const createConnectingRequest = async (
  request: Omit<ConnectingRequest, "id">
): Promise<ConnectingRequest | null> => {
  try {
    const newRequest = await firestoreService.create<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      request
    );
    return newRequest;
  } catch (error) {
    console.log("Creating connecting request failed:", error);
    return null;
  }
};

// Get incoming requests for a User
export const getIncomingRequests = async (
  userId: string
): Promise<ConnectingRequest[]> => {
  try {
    return await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [{ field: "receiverId", operator: "==", value: userId }]
    );
  } catch (error) {
    console.log("Fetching incoming requests failed:", error);
    return [];
  }
};

// Get sent requests for a User
export const getSentRequests = async (
  userId: string
): Promise<ConnectingRequest[]> => {
  try {
    return await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [{ field: "senderId", operator: "==", value: userId }]
    );
  } catch (error) {
    console.log("Fetching sent requests failed:", error);
    return [];
  }
};

// Get list of users based on list of requests
export const getUsersFromRequests = async (
  requests: ConnectingRequest[],
  type: "sender" | "receiver" = "sender"
): Promise<User[]> => {
  try {
    const userIds = Array.from(
      new Set(
        requests
          .map((req) => (type === "sender" ? req.senderId : req.receiverId))
          .filter(Boolean)
      )
    );

    console.log(userIds);
    console.log(requests);

    return await getUsersByIds(userIds);
  } catch (error) {
    console.log("Fetching users from requests failed:", error);
    return [];
  }
};

// Accept a connecting request
export const acceptRequest = async (
  requestId: string
): Promise<ConnectingRequest | null> => {
  try {
    const updated = await firestoreService.update<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId,
      {
        status: REQUEST_STATUS.Accepted.label,
      }
    );
    return updated;
  } catch (error) {
    console.log("Accepting request failed:", error);
    return null;
  }
};

// Deny a connecting request
export const denyRequest = async (
  requestId: string
): Promise<ConnectingRequest | null> => {
  try {
    const updated = await firestoreService.update<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId,
      {
        status: REQUEST_STATUS.Denied.label,
      }
    );
    return updated;
  } catch (error) {
    console.log("Denying request failed:", error);
    return null;
  }
};

// Create new friends connection when a request is already handled as accepted
export const addFriendsByRequestId = async (
  requestId: string
): Promise<boolean> => {
  try {
    // Get the request details
    const request = await firestoreService.getById<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId
    );
    if (!request) {
      throw new Error("Request not found");
    }

    const { senderId, receiverId } = request;

    // Get both users
    const [sender, receiver] = await Promise.all([
      getUserById(senderId),
      getUserById(receiverId),
    ]);

    if (!sender || !receiver) {
      throw new Error("Users not found");
    }

    // Update friends arrays (avoid duplicates)
    const updatedSenderFriends = Array.isArray(sender.friends)
      ? Array.from(new Set([...sender.friends, receiverId]))
      : [receiverId];
    const updatedReceiverFriends = Array.isArray(receiver.friends)
      ? Array.from(new Set([...receiver.friends, senderId]))
      : [senderId];

    // Use batch operation for atomic update
    await firestoreService.batchWrite([
      {
        type: "update",
        collection: COLLECTIONS.USERS,
        id: senderId,
        data: { friends: updatedSenderFriends },
      },
      {
        type: "update",
        collection: COLLECTIONS.USERS,
        id: receiverId,
        data: { friends: updatedReceiverFriends },
      },
    ]);

    return true;
  } catch (error) {
    console.log("Adding friends by requestId failed:", error);
    return false;
  }
};

// Resending a denied request
export const resendDeniedRequest = async (
  requestId: string
): Promise<ConnectingRequest | null> => {
  try {
    // Get the request details
    const request = await firestoreService.getById<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId
    );
    if (!request) {
      throw new Error("Request not found");
    }

    // Check if the request is denied
    if (request.status !== REQUEST_STATUS.Denied.label) {
      throw new Error("Request is not in denied status.");
    }

    // Update the request status to waiting
    const updated = await firestoreService.update<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId,
      {
        status: REQUEST_STATUS.Waiting.label,
      }
    );

    return updated;
  } catch (error) {
    console.log("Resending denied request failed:", error);
    return null;
  }
};

// Delete a request if user changes their mind
export const deleteRequest = async (requestId: string): Promise<boolean> => {
  try {
    // Get the request details first
    const request = await firestoreService.getById<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId
    );
    if (!request) {
      throw new Error("Request not found");
    }

    // Only allow delete if status is "Waiting"
    if (request.status !== REQUEST_STATUS.Waiting.label) {
      throw new Error("Only requests with 'Waiting' status can be deleted.");
    }

    await firestoreService.delete(COLLECTIONS.REQUESTS, requestId);
    return true;
  } catch (error) {
    console.log("Deleting request failed:", error);
    return false;
  }
};
