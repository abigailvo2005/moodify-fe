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
// ← Check if there's already a pending request between these users
export const hasPendingRequest = async (
  userAId: string,
  userBId: string
): Promise<boolean> => {
  try {
    const requests = await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [
        {
          field: "status",
          operator: "in",
          value: [REQUEST_STATUS.Waiting.label, REQUEST_STATUS.Accepted.label],
        },
      ]
    );

    // Check for both directions (any pending or accepted request)
    return requests.some(
      (req) =>
        (req.senderId === userAId && req.receiverId === userBId) ||
        (req.senderId === userBId && req.receiverId === userAId)
    );
  } catch (error) {
    console.log("Checking pending request failed:", error);
    return false;
  }
};

// ← NEW: Check if user can send request (allows denied requests to be overridden)
export const canSendRequest = async (
  senderId: string,
  receiverId: string
): Promise<{ canSend: boolean; reason?: string }> => {
  try {
    console.log(`🔍 Checking if ${senderId} can send request to ${receiverId}`);

    const requests = await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [
        {
          field: "status",
          operator: "in",
          value: [REQUEST_STATUS.Waiting.label, REQUEST_STATUS.Accepted.label],
        },
      ]
    );

    // Check for any active request between these users
    const existingRequest = requests.find(
      (req) =>
        (req.senderId === senderId && req.receiverId === receiverId) ||
        (req.senderId === receiverId && req.receiverId === senderId)
    );

    if (existingRequest) {
      if (existingRequest.status === REQUEST_STATUS.Accepted.label) {
        return {
          canSend: false,
          reason: "You are already friends with this user",
        };
      }

      if (existingRequest.status === REQUEST_STATUS.Waiting.label) {
        if (existingRequest.senderId === senderId) {
          return {
            canSend: false,
            reason: "You already have a pending request to this user",
          };
        } else {
          return {
            canSend: false,
            reason:
              "This user has already sent you a request. Please check your incoming requests.",
          };
        }
      }
    }

    // Allow sending if no active request or only denied requests exist
    return { canSend: true };
  } catch (error) {
    console.log("Error checking if can send request:", error);
    return { canSend: false, reason: "Error checking request status" };
  }
};

// ← UPDATED: Accept a connecting request with conflict resolution
export const acceptRequest = async (
  requestId: string
): Promise<ConnectingRequest | null> => {
  try {
    console.log(`✅ Accepting request: ${requestId}`);

    // Get the request details first
    const request = await firestoreService.getById<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId
    );
    if (!request) {
      throw new Error("Request not found");
    }

    const { senderId, receiverId } = request;
    console.log(`👥 Processing request: ${senderId} -> ${receiverId}`);

    // ← NEW: Check for and handle opposing request
    console.log("🔍 Checking for opposing requests...");
    const allRequests = await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [
        {
          field: "status",
          operator: "==",
          value: REQUEST_STATUS.Waiting.label,
        },
      ]
    );

    // Find opposing request (from receiverId to senderId)
    const opposingRequest = allRequests.find(
      (req) =>
        req.id !== requestId && // Not the same request
        req.senderId === receiverId &&
        req.receiverId === senderId
    );

    if (opposingRequest && opposingRequest.id) {
      console.log(
        `🗑️ Found opposing request ${opposingRequest.id}, will delete it`
      );
    }

    // ← NEW: Use batch operation to accept current request and delete opposing request
    const batchOperations: Array<{
      type: "update" | "delete";
      collection: string;
      id: string;
      data?: any;
    }> = [];

    // Accept the current request
    batchOperations.push({
      type: "update",
      collection: COLLECTIONS.REQUESTS,
      id: requestId,
      data: {
        isAccepted: true,
        status: REQUEST_STATUS.Accepted.label,
      },
    });

    // Delete opposing request if exists
    if (opposingRequest && opposingRequest.id) {
      batchOperations.push({
        type: "delete",
        collection: COLLECTIONS.REQUESTS,
        id: opposingRequest.id,
      });
    }

    // Execute batch operations
    await firestoreService.batchWrite(batchOperations);

    if (opposingRequest) {
      console.log("✅ Accepted request and deleted opposing request");
    } else {
      console.log("✅ Accepted request (no opposing request found)");
    }

    // Return the updated request
    const updated = await firestoreService.getById<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      requestId
    );
    return updated;
  } catch (error) {
    console.log("❌ Accepting request failed:", error);
    return null;
  }
};

// ← UPDATED: Create connecting request with better validation
export const createConnectingRequest = async (
  request: ConnectingRequest
): Promise<ConnectingRequest | null> => {
  try {
    console.log("📤 Creating connecting request...");

    // ← NEW: Check if request can be sent
    const canSend = await canSendRequest(request.senderId, request.receiverId);
    if (!canSend.canSend) {
      throw new Error(canSend.reason || "Cannot send request");
    }

    // ← NEW: Check for existing denied request and update it instead
    const existingRequests =
      await firestoreService.queryWhere<ConnectingRequest>(
        COLLECTIONS.REQUESTS,
        [
          { field: "senderId", operator: "==", value: request.senderId },
          { field: "receiverId", operator: "==", value: request.receiverId },
          {
            field: "status",
            operator: "==",
            value: REQUEST_STATUS.Denied.label,
          },
        ]
      );

    if (existingRequests.length > 0) {
      // Update existing denied request instead of creating new one
      const existingRequest = existingRequests[0];
      console.log(`🔄 Updating existing denied request: ${existingRequest.id}`);

      const updated = await firestoreService.update<ConnectingRequest>(
        COLLECTIONS.REQUESTS,
        existingRequest.id!,
        {
          status: REQUEST_STATUS.Waiting.label,
          date: request.date, // Update date to current
        }
      );

      console.log("✅ Updated existing denied request to waiting");
      return updated;
    }

    // Create new request if no existing denied request found
    const newRequest = await firestoreService.create<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      request
    );

    console.log("✅ Created new connecting request");
    return newRequest;
  } catch (error) {
    console.log("❌ Creating connecting request failed:", error);
    throw error; // Re-throw to let UI handle the error message
  }
};

// ← UPDATED: Enhanced hasPendingRequest for UI to show better messages
export const getRequestStatus = async (
  userAId: string,
  userBId: string
): Promise<{
  hasRequest: boolean;
  status?: string;
  direction?: "outgoing" | "incoming";
  requestId?: string;
}> => {
  try {
    const requests = await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [
        {
          field: "status",
          operator: "in",
          value: [
            REQUEST_STATUS.Waiting.label,
            REQUEST_STATUS.Accepted.label,
            REQUEST_STATUS.Denied.label,
          ],
        },
      ]
    );

    // Check for request from A to B
    const outgoingRequest = requests.find(
      (req) => req.senderId === userAId && req.receiverId === userBId
    );

    // Check for request from B to A
    const incomingRequest = requests.find(
      (req) => req.senderId === userBId && req.receiverId === userAId
    );

    if (outgoingRequest) {
      return {
        hasRequest: true,
        status: outgoingRequest.status,
        direction: "outgoing",
        requestId: outgoingRequest.id,
      };
    }

    if (incomingRequest) {
      return {
        hasRequest: true,
        status: incomingRequest.status,
        direction: "incoming",
        requestId: incomingRequest.id,
      };
    }

    return { hasRequest: false };
  } catch (error) {
    console.log("Error getting request status:", error);
    return { hasRequest: false };
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

    return await getUsersByIds(userIds);
  } catch (error) {
    console.log("Fetching users from requests failed:", error);
    return [];
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
        isAccepted: false,
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
        isAccepted: false, // Reset acceptance
        date: new Date().toISOString(), // Update date to current
        // Reset status to waiting
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

// Delete a friend from list and mark original request as denied
export const deleteFriend = async (
  userId: string,
  friendId: string
): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting friend relationship: ${userId} <-> ${friendId}`);

    // Step 1: Find the original accepted request between these users
    console.log("🔍 Finding original request between users...");

    const requests = await firestoreService.queryWhere<ConnectingRequest>(
      COLLECTIONS.REQUESTS,
      [
        {
          field: "status",
          operator: "==",
          value: REQUEST_STATUS.Accepted.label,
        },
      ]
    );

    console.log(`Found: ${requests}`);

    // Find the request between these two users (could be either direction)
    const originalRequest = requests.find(
      (req) =>
        (req.senderId === userId && req.receiverId === friendId) ||
        (req.senderId === friendId && req.receiverId === userId)
    );

    // Step 2: Update the request status to "Denied" if found
    if (originalRequest && originalRequest.id) {
      console.log(
        `📝 Updating request ${originalRequest.id} status to Denied...`
      );

      await firestoreService.update<ConnectingRequest>(
        COLLECTIONS.REQUESTS,
        originalRequest.id,
        {
          status: REQUEST_STATUS.Denied.label,
        }
      );

      console.log("✅ Request status updated to Denied");
    } else {
      console.log(
        "⚠️ No accepted request found between users (they might have been added through another method)"
      );
    }

    // Step 3: Get both users (existing logic)
    const [user, friend] = await Promise.all([
      getUserById(userId),
      getUserById(friendId),
    ]);

    if (!user || !friend) {
      throw new Error("User or friend not found");
    }

    // Step 4: Remove each other from friends lists (existing logic)
    const updatedUserFriends = Array.isArray(user.friends)
      ? user.friends.filter((id: string) => id !== friendId)
      : [];

    const updatedFriendFriends = Array.isArray(friend.friends)
      ? friend.friends.filter((id: string) => id !== userId)
      : [];

    // Step 5: Use batch operation for atomic update of users (existing logic)
    await firestoreService.batchWrite([
      {
        type: "update",
        collection: COLLECTIONS.USERS,
        id: userId,
        data: { friends: updatedUserFriends },
      },
      {
        type: "update",
        collection: COLLECTIONS.USERS,
        id: friendId,
        data: { friends: updatedFriendFriends },
      },
    ]);

    console.log("✅ Friend relationship deleted successfully");
    console.log(
      `📊 Summary: Removed friendship + Set original request to Denied`
    );

    return true;
  } catch (error) {
    console.log("❌ Deleting friend failed:", error);
    return false;
  }
};
