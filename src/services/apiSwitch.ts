// src/services/apiSwitch.ts
// Import both API services
import * as MockAPI from "./api"; // Your original api.ts
import * as FirestoreAPI from "./firestoreApi"; // New Firestore API
import { USE_FIREBASE } from "@env";

// Type definitions for API functions
interface APIService {
  loginUser: typeof MockAPI.loginUser;
  registerUser: typeof MockAPI.registerUser;
  updateUser: typeof MockAPI.updateUser;
  isUsernameExisted: typeof MockAPI.isUsernameExisted;
  checkReferralCode: typeof MockAPI.checkReferralCode;
  getMoods: typeof MockAPI.getMoods;
  createMood: typeof MockAPI.createMood;
  updateMood: typeof MockAPI.updateMood;
  deleteMood: typeof MockAPI.deleteMood;
  getMoodById: typeof MockAPI.getMoodById;
  getFriends: typeof MockAPI.getFriends;
  hasPendingRequest: typeof MockAPI.hasPendingRequest;
  getUserById: typeof MockAPI.getUserById;
  getUserByReferralCode: typeof MockAPI.getUserByReferralCode;
  createConnectingRequest: typeof MockAPI.createConnectingRequest;
  getIncomingRequests: typeof MockAPI.getIncomingRequests;
  getSentRequests: typeof MockAPI.getSentRequests;
  getUsersFromRequests: typeof MockAPI.getUsersFromRequests;
  acceptRequest: typeof MockAPI.acceptRequest;
  denyRequest: typeof MockAPI.denyRequest;
  addFriendsByRequestId: typeof MockAPI.addFriendsByRequestId;
  resendDeniedRequest: typeof MockAPI.resendDeniedRequest;
  deleteRequest: typeof MockAPI.deleteRequest;
  getUsersByIds: typeof MockAPI.getUsersByIds;
}

// Feature flag to determine which API to use (Expo environment variables)
const useFirebase = USE_FIREBASE === "true";

console.log(
  `🔧 API Service: Using ${useFirebase ? "Firebase Firestore" : "MockAPI"}`
);

// Create unified API service
export const API: APIService = {
  // User operations
  loginUser: useFirebase ? FirestoreAPI.loginUser : MockAPI.loginUser,
  registerUser: useFirebase ? FirestoreAPI.registerUser : MockAPI.registerUser,
  updateUser: useFirebase ? FirestoreAPI.updateUser : MockAPI.updateUser,
  isUsernameExisted: useFirebase
    ? FirestoreAPI.isUsernameExisted
    : MockAPI.isUsernameExisted,
  checkReferralCode: useFirebase
    ? FirestoreAPI.checkReferralCode
    : MockAPI.checkReferralCode,
  getUserById: useFirebase ? FirestoreAPI.getUserById : MockAPI.getUserById,
  getUserByReferralCode: useFirebase
    ? FirestoreAPI.getUserByReferralCode
    : MockAPI.getUserByReferralCode,
  getUsersByIds: useFirebase
    ? FirestoreAPI.getUsersByIds
    : MockAPI.getUsersByIds,

  // Mood operations
  getMoods: useFirebase ? FirestoreAPI.getMoods : MockAPI.getMoods,
  createMood: useFirebase ? FirestoreAPI.createMood : MockAPI.createMood,
  updateMood: useFirebase ? FirestoreAPI.updateMood : MockAPI.updateMood,
  deleteMood: useFirebase ? FirestoreAPI.deleteMood : MockAPI.deleteMood,
  getMoodById: useFirebase ? FirestoreAPI.getMoodById : MockAPI.getMoodById,

  // Friend operations
  getFriends: useFirebase
    ? (FirestoreAPI.getFriends as typeof MockAPI.getFriends)
    : MockAPI.getFriends,

  // Request operations
  hasPendingRequest: useFirebase
    ? FirestoreAPI.hasPendingRequest
    : MockAPI.hasPendingRequest,
  createConnectingRequest: useFirebase
    ? FirestoreAPI.createConnectingRequest
    : MockAPI.createConnectingRequest,
  getIncomingRequests: useFirebase
    ? FirestoreAPI.getIncomingRequests
    : MockAPI.getIncomingRequests,
  getSentRequests: useFirebase
    ? FirestoreAPI.getSentRequests
    : MockAPI.getSentRequests,
  getUsersFromRequests: useFirebase
    ? FirestoreAPI.getUsersFromRequests
    : MockAPI.getUsersFromRequests,
  acceptRequest: useFirebase
    ? FirestoreAPI.acceptRequest
    : MockAPI.acceptRequest,
  denyRequest: useFirebase ? FirestoreAPI.denyRequest : MockAPI.denyRequest,
  addFriendsByRequestId: useFirebase
    ? FirestoreAPI.addFriendsByRequestId
    : MockAPI.addFriendsByRequestId,
  resendDeniedRequest: useFirebase
    ? FirestoreAPI.resendDeniedRequest
    : MockAPI.resendDeniedRequest,
  deleteRequest: useFirebase
    ? FirestoreAPI.deleteRequest
    : MockAPI.deleteRequest,
};

// Export current service type for debugging
export const getCurrentAPIType = (): "MockAPI" | "Firebase" => {
  return useFirebase ? "Firebase" : "MockAPI";
};

// Export individual APIs for direct access if needed
export { MockAPI, FirestoreAPI };

// Export specific functions (backward compatibility)
export const {
  loginUser,
  registerUser,
  updateUser,
  isUsernameExisted,
  checkReferralCode,
  getMoods,
  createMood,
  updateMood,
  deleteMood,
  getMoodById,
  getFriends,
  hasPendingRequest,
  getUserById,
  getUserByReferralCode,
  createConnectingRequest,
  getIncomingRequests,
  getSentRequests,
  getUsersFromRequests,
  acceptRequest,
  denyRequest,
  addFriendsByRequestId,
  resendDeniedRequest,
  deleteRequest,
  getUsersByIds,
} = API;

export default API;
