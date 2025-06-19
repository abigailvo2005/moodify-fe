// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from "react-native";
// import uuid from "react-native-uuid";
// import { REQUEST_STATUS } from "../constants";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   acceptRequest,
//   addFriendsByRequestId,
//   createConnectingRequest,
//   deleteRequest,
//   denyRequest,
//   getIncomingRequests,
//   getSentRequests,
//   getUserById,
//   getUserByReferralCode,
//   getUsersFromRequests,
//   hasPendingRequest,
//   resendDeniedRequest,
// } from "../services/apiSwitch";
// import { ConnectingRequest, User } from "../types/index";
// import { formatDate } from "../utils/formatDate";

// // Functions to get appropriate request status
// type RequestStatusKey = keyof typeof REQUEST_STATUS;

// function isRequestStatusKey(key: string): key is RequestStatusKey {
//   return Object.prototype.hasOwnProperty.call(REQUEST_STATUS, key);
// }

// function getRequestStatusIcon(status: string): string {
//   if (isRequestStatusKey(status)) {
//     return REQUEST_STATUS[status].icon;
//   }
//   return "❓";
// }

// function getRequestStatusLabel(status: string): string {
//   if (isRequestStatusKey(status)) {
//     return REQUEST_STATUS[status].label;
//   }
//   return "Unknown";
// }

// export default function ConnectFriendsScreen() {
//   const [referralCode, setReferralCode] = useState("");
//   const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");
//   const [incomingRequests, setIncomingRequests] = useState<ConnectingRequest[]>(
//     []
//   );
//   const [incomingUsers, setIncomingUsers] = useState<User[]>([]);
//   const [sentRequests, setSentRequests] = useState<ConnectingRequest[]>([]);
//   const [sentUsers, setSentUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInitialLoading, setIsInitialLoading] = useState(true); // ← NEW: Initial loading state
//   const { user, setUser } = useAuth();

//   const currentUserId = user?.id || "";

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   // ← UPDATED: Better loading management
//   const fetchRequests = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Fetching incoming requests...");
//       console.log("Fetching sent requests...");

//       // Fetch all data in parallel
//       const [sentRequestsData, incomingRequestsData] = await Promise.all([
//         getSentRequests(currentUserId),
//         getIncomingRequests(currentUserId),
//       ]);

//       setSentRequests(sentRequestsData);
//       setIncomingRequests(incomingRequestsData);

//       // Fetch users for requests in parallel
//       const [sentUsersData, incomingUsersData] = await Promise.all([
//         getUsersFromRequests(sentRequestsData, "receiver"),
//         getUsersFromRequests(incomingRequestsData, "sender"),
//       ]);

//       setSentUsers(sentUsersData);
//       setIncomingUsers(incomingUsersData);
//     } catch (error) {
//       console.log("Error fetching requests:", error);
//       Alert.alert("Error", "Failed to load requests. Please try again.");
//     } finally {
//       setIsLoading(false);
//       setIsInitialLoading(false); // ← Mark initial loading as complete
//     }
//   };

//   const handleConnect = async () => {
//     if (!referralCode.trim()) {
//       Alert.alert("Oops! 😅", "Please enter a referral code");
//       return;
//     }

//     const receiver: User | null = await getUserByReferralCode(referralCode);

//     if (!receiver?.id) {
//       Alert.alert("Oops! 😅", "We cannot find anyone with this referral code.");
//       return;
//     }

//     if (await hasPendingRequest(currentUserId, receiver.id)) {
//       Alert.alert(
//         "Request Already Exists! 🔄",
//         "There's already a pending request between you and this user. Please wait for it to be processed."
//       );
//       return;
//     }

//     try {
//       setIsLoading(true);
//       console.log(
//         "Sending connection request with referral code:",
//         referralCode
//       );

//       const newRequest: ConnectingRequest = {
//         id: uuid.v4(),
//         date: formatDate(new Date(), false),
//         senderId: currentUserId,
//         receiverId: receiver.id,
//         isAccepted: false,
//         status: REQUEST_STATUS.Waiting.label,
//       };

//       await createConnectingRequest(newRequest);
//       setIsLoading(false);
//       Alert.alert("Yay! 🎉", "Connection request sent successfully!");

//       await fetchRequests();
//       setReferralCode("");
//       setActiveTab("sent");
//     } catch (error) {
//       console.log("Error sending connection request:", error);
//       Alert.alert(
//         "Oops! 😅",
//         "Failed to send connection request. Please try again."
//       );
//       setIsLoading(false);
//     }
//   };

//   const handleApproveRequest = async (requestId: string) => {
//     try {
//       console.log("Approving request:", requestId);
//       setIsLoading(true);
//       await acceptRequest(requestId);
//       await addFriendsByRequestId(requestId);
//       setIsLoading(false);

//       Alert.alert("You are now friends! 💕", "Check your friends' moods now!");
//       await fetchRequests();

//       const refreshedUser = await getUserById(currentUserId);
//       setUser(refreshedUser);
//     } catch (error) {
//       console.log("Error approving request:", error);
//       Alert.alert("Oops! 😅", "Failed to accept request. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   const handleDenyRequest = async (requestId: string) => {
//     try {
//       console.log("Denying request:", requestId);
//       setIsLoading(true);
//       await denyRequest(requestId);
//       setIsLoading(false);

//       Alert.alert(
//         "Denied Request 👋",
//         "You can still send them a request in the future!"
//       );
//       await fetchRequests();
//     } catch (error) {
//       console.log("Error denying request:", error);
//       Alert.alert("Oops! 😅", "Failed to deny request. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   const handleResendRequest = async (requestId: string) => {
//     try {
//       console.log("Resending request:", requestId);
//       setIsLoading(true);
//       await resendDeniedRequest(requestId);
//       setIsLoading(false);

//       Alert.alert("Resent! 🔄", "Let's wait for the other user to respond!");
//       await fetchRequests();
//     } catch (error) {
//       console.log("Error resending request:", error);
//       Alert.alert("Oops! 😅", "Failed to resend request. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   // ← ADD: Show loading screen during initial load
//   if (isInitialLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="rgba(243, 180, 196, 0.8)" />
//         <Text style={styles.loadingText}>Loading connections...</Text>
//       </View>
//     );
//   }

//   const renderIncomingRequest = (request: ConnectingRequest) => {
//     const sender = incomingUsers.find((user) => user.id === request.senderId);

//     return (
//       <View key={request.id} style={styles.requestCard}>
//         <View style={styles.requestHeader}>
//           <View style={styles.userInfo}>
//             <Text style={styles.userName}>{sender?.name || "none"}</Text>
//             <Text style={styles.userHandle}>@{sender?.username || "none"}</Text>
//           </View>
//           <Text style={styles.requestDate}>{request.date || "No Date"}</Text>
//         </View>

//         {request.status === REQUEST_STATUS.Waiting.label ? (
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.approveButton]}
//               onPress={() => request.id && handleApproveRequest(request.id)}
//               activeOpacity={0.8}
//               disabled={isLoading} // ← ADD: Disable during loading
//             >
//               <Text style={styles.approveButtonText}>Accept 💕</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.denyButton]}
//               onPress={() => request.id && handleDenyRequest(request.id)}
//               activeOpacity={0.8}
//               disabled={isLoading} // ← ADD: Disable during loading
//             >
//               <Text style={styles.denyButtonText}>Deny 👋</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View style={styles.statusContainer}>
//             <Text style={styles.statusText}>
//               {getRequestStatusIcon(request.status)}{" "}
//               {getRequestStatusLabel(request.status)}
//             </Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderSentRequest = (request: ConnectingRequest) => {
//     const receiver = sentUsers.find((user) => user.id === request.receiverId);

//     return (
//       <View key={request.id} style={styles.requestCard}>
//         <View style={styles.requestHeader}>
//           <View style={styles.userInfo}>
//             <Text style={styles.userName}>{receiver?.name || "none"}</Text>
//             <Text style={styles.userHandle}>
//               @{receiver?.username || "none"}
//             </Text>
//           </View>
//           <Text style={styles.requestDate}>{request.date || "No Date"}</Text>
//         </View>

//         <View style={styles.statusContainer}>
//           <Text style={styles.statusText}>
//             {getRequestStatusIcon(request.status)}{" "}
//             {getRequestStatusLabel(request.status)}
//           </Text>

//           {request.status === REQUEST_STATUS.Denied.label && (
//             <TouchableOpacity
//               style={styles.resendButton}
//               onPress={() => request.id && handleResendRequest(request.id)}
//               activeOpacity={0.8}
//               disabled={isLoading} // ← ADD: Disable during loading
//             >
//               <Text style={styles.resendButtonText}>Resend 🔄</Text>
//             </TouchableOpacity>
//           )}

//           {request.status === REQUEST_STATUS.Waiting.label && (
//             <TouchableOpacity
//               style={[
//                 styles.resendButton,
//                 {
//                   backgroundColor: "#fff",
//                   borderWidth: 1,
//                   borderColor: "rgba(243, 180, 196, 0.6)",
//                 },
//               ]}
//               onPress={() => {
//                 Alert.alert(
//                   "Delete Request",
//                   "Are you sure you want to delete this request?",
//                   [
//                     { text: "Cancel", style: "cancel" },
//                     {
//                       text: "Delete",
//                       style: "destructive",
//                       onPress: async () => {
//                         try {
//                           setIsLoading(true);
//                           if (request.id) {
//                             await deleteRequest(request.id);
//                           }
//                           setIsLoading(false);
//                           Alert.alert(
//                             "Deleted",
//                             "Your request has been deleted."
//                           );
//                           await fetchRequests();
//                         } catch (error) {
//                           setIsLoading(false);
//                           Alert.alert("Error", "Failed to delete request.");
//                         }
//                       },
//                     },
//                   ]
//                 );
//               }}
//               activeOpacity={0.8}
//               disabled={isLoading} // ← ADD: Disable during loading
//             >
//               <Text
//                 style={[
//                   styles.resendButtonText,
//                   { color: "rgba(93, 22, 40, 0.7)" },
//                 ]}
//               >
//                 Delete ❌
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.screenContainer}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={styles.scrollContentContainer}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Connect Friends</Text>
//           <Text style={styles.subtitle}>Build your circle of support! 💫</Text>
//         </View>

//         {/* Referral Code Input */}
//         <View style={styles.inputSection}>
//           <Text style={styles.sectionTitle}>Add New Friend 🌸</Text>
//           <View style={styles.inputGroup}>
//             <TextInput
//               value={referralCode}
//               onChangeText={setReferralCode}
//               style={styles.input}
//               placeholder="Enter friend's referral code"
//               placeholderTextColor="rgba(93, 22, 40, 0.4)"
//               autoCapitalize="none"
//             />
//             <TouchableOpacity
//               style={[
//                 styles.connectButton,
//                 isLoading && styles.connectButtonDisabled,
//               ]} // ← ADD: Visual feedback during loading
//               onPress={handleConnect}
//               activeOpacity={0.8}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="rgba(93, 22, 40, 0.9)" />
//               ) : (
//                 <Text style={styles.connectButtonText}>Connect 💕</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Tabs */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === "incoming" && styles.activeTab]}
//             onPress={() => setActiveTab("incoming")}
//             activeOpacity={0.8}
//           >
//             <Text
//               style={[
//                 styles.tabText,
//                 activeTab === "incoming" && styles.activeTabText,
//               ]}
//             >
//               Incoming ({incomingRequests.length})
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === "sent" && styles.activeTab]}
//             onPress={() => setActiveTab("sent")}
//             activeOpacity={0.8}
//           >
//             <Text
//               style={[
//                 styles.tabText,
//                 activeTab === "sent" && styles.activeTabText,
//               ]}
//             >
//               Sent ({sentRequests.length})
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Requests List */}
//         <View style={styles.requestsContainer}>
//           {activeTab === "incoming" ? (
//             incomingRequests.length > 0 ? (
//               incomingRequests.map(renderIncomingRequest)
//             ) : (
//               <View style={styles.emptyState}>
//                 <Text style={styles.emptyStateText}>
//                   No incoming requests 📭
//                 </Text>
//                 <Text style={styles.emptyStateSubtext}>
//                   When someone sends you a connection request, it will appear
//                   here!
//                 </Text>
//               </View>
//             )
//           ) : sentRequests.length > 0 ? (
//             sentRequests.map(renderSentRequest)
//           ) : (
//             <View style={styles.emptyState}>
//               <Text style={styles.emptyStateText}>No sent requests 📤</Text>
//               <Text style={styles.emptyStateSubtext}>
//                 Start connecting with friends by entering their referral code
//                 above!
//               </Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   screenContainer: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingTop: 20,
//   },

//   container: {
//     flex: 1,
//   },

//   scrollContentContainer: {
//     flexGrow: 1,
//     paddingBottom: 40,
//   },

//   // ← ADD: Loading container styles
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingTop: 20,
//   },

//   loadingText: {
//     fontSize: 16,
//     color: "rgba(93, 22, 40, 0.7)",
//     fontFamily: "FredokaSemiBold",
//     marginTop: 16,
//   },

//   header: {
//     paddingHorizontal: 24,
//     paddingVertical: 20,
//     alignItems: "center",
//     marginBottom: 24,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "rgba(93, 22, 40, 0.9)",
//     fontFamily: "FredokaSemiBold",
//     textAlign: "center",
//     marginBottom: 8,
//   },

//   subtitle: {
//     fontSize: 16,
//     color: "rgba(93, 22, 40, 0.6)",
//     fontFamily: "Fredoka",
//     textAlign: "center",
//   },

//   inputSection: {
//     paddingHorizontal: 24,
//     marginBottom: 32,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "rgba(93, 22, 40, 0.8)",
//     fontFamily: "FredokaSemiBold",
//     marginBottom: 16,
//   },

//   inputGroup: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },

//   input: {
//     flex: 1,
//     backgroundColor: "rgba(243, 180, 196, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(243, 180, 196, 0.3)",
//     borderRadius: 16,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: "rgba(93, 22, 40, 0.8)",
//     fontFamily: "Fredoka",
//     minHeight: 50,
//   },

//   connectButton: {
//     backgroundColor: "rgba(243, 180, 196, 0.8)",
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },

//   // ← ADD: Disabled button style
//   connectButtonDisabled: {
//     backgroundColor: "rgba(243, 180, 196, 0.4)",
//     shadowOpacity: 0,
//   },

//   connectButtonText: {
//     color: "rgba(93, 22, 40, 0.9)",
//     fontSize: 16,
//     fontWeight: "600",
//     fontFamily: "FredokaSemiBold",
//   },

//   tabContainer: {
//     flexDirection: "row",
//     paddingHorizontal: 24,
//     marginBottom: 20,
//     backgroundColor: "rgba(243, 180, 196, 0.1)",
//     marginHorizontal: 24,
//     borderRadius: 20,
//     padding: 4,
//   },

//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: "center",
//     borderRadius: 16,
//   },

//   activeTab: {
//     backgroundColor: "rgba(243, 180, 196, 0.8)",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },

//   tabText: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "rgba(93, 22, 40, 0.6)",
//     fontFamily: "Fredoka",
//   },

//   activeTabText: {
//     color: "rgba(93, 22, 40, 0.9)",
//     fontWeight: "600",
//     fontFamily: "FredokaSemiBold",
//   },

//   requestsContainer: {
//     paddingHorizontal: 24,
//   },

//   requestCard: {
//     backgroundColor: "rgba(243, 180, 196, 0.05)",
//     borderWidth: 2,
//     borderColor: "rgba(243, 180, 196, 0.2)",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//   },

//   requestHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   },

//   userInfo: {
//     flex: 1,
//   },

//   userName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "rgba(93, 22, 40, 0.9)",
//     fontFamily: "FredokaSemiBold",
//     marginBottom: 2,
//   },

//   userHandle: {
//     fontSize: 14,
//     color: "rgba(93, 22, 40, 0.6)",
//     fontFamily: "Fredoka",
//   },

//   requestDate: {
//     fontSize: 12,
//     color: "rgba(93, 22, 40, 0.5)",
//     fontFamily: "Fredoka",
//   },

//   actionButtons: {
//     flexDirection: "row",
//     gap: 8,
//   },

//   actionButton: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   approveButton: {
//     backgroundColor: "rgba(243, 180, 196, 0.8)",
//   },

//   denyButton: {
//     backgroundColor: "transparent",
//     borderWidth: 2,
//     borderColor: "rgba(243, 180, 196, 0.6)",
//   },

//   resendButton: {
//     backgroundColor: "rgba(243, 180, 196, 0.6)",
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 12,
//     marginTop: 8,
//   },

//   approveButtonText: {
//     color: "rgba(93, 22, 40, 0.9)",
//     fontSize: 14,
//     fontWeight: "600",
//     fontFamily: "FredokaSemiBold",
//   },

//   denyButtonText: {
//     color: "rgba(93, 22, 40, 0.7)",
//     fontSize: 14,
//     fontWeight: "500",
//     fontFamily: "Fredoka",
//   },

//   resendButtonText: {
//     color: "rgba(93, 22, 40, 0.9)",
//     fontSize: 12,
//     fontWeight: "500",
//     fontFamily: "Fredoka",
//   },

//   statusContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   statusText: {
//     fontSize: 14,
//     color: "rgba(93, 22, 40, 0.7)",
//     fontFamily: "Fredoka",
//     fontWeight: "500",
//   },

//   emptyState: {
//     alignItems: "center",
//     paddingVertical: 40,
//   },

//   emptyStateText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "rgba(93, 22, 40, 0.7)",
//     fontFamily: "FredokaSemiBold",
//     marginBottom: 8,
//   },

//   emptyStateSubtext: {
//     fontSize: 14,
//     color: "rgba(93, 22, 40, 0.5)",
//     fontFamily: "Fredoka",
//     textAlign: "center",
//     lineHeight: 20,
//   },

//   bottomSpacing: {
//     height: 60,
//   },
// });

// src/screens/ConnectFriendsScreen.tsx - UPDATED với Pull-to-Refresh
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl, // ← ADD: Import RefreshControl
} from "react-native";
import uuid from "react-native-uuid";
import { REQUEST_STATUS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import {
  acceptRequest,
  addFriendsByRequestId,
  createConnectingRequest,
  deleteRequest,
  denyRequest,
  getIncomingRequests,
  getSentRequests,
  getUserById,
  getUserByReferralCode,
  getUsersFromRequests,
  hasPendingRequest,
  resendDeniedRequest,
} from "../services/apiSwitch";
import { ConnectingRequest, User } from "../types/index";
import { formatDate } from "../utils/formatDate";

// Functions to get appropriate request status
type RequestStatusKey = keyof typeof REQUEST_STATUS;

function isRequestStatusKey(key: string): key is RequestStatusKey {
  return Object.prototype.hasOwnProperty.call(REQUEST_STATUS, key);
}

function getRequestStatusIcon(status: string): string {
  if (isRequestStatusKey(status)) {
    return REQUEST_STATUS[status].icon;
  }
  return "❓";
}

function getRequestStatusLabel(status: string): string {
  if (isRequestStatusKey(status)) {
    return REQUEST_STATUS[status].label;
  }
  return "Unknown";
}

export default function ConnectFriendsScreen() {
  const [referralCode, setReferralCode] = useState("");
  const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");
  const [incomingRequests, setIncomingRequests] = useState<ConnectingRequest[]>(
    []
  );
  const [incomingUsers, setIncomingUsers] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectingRequest[]>([]);
  const [sentUsers, setSentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ← ADD: Refreshing state
  const { user, setUser } = useAuth();

  const currentUserId = user?.id || "";

  useEffect(() => {
    fetchRequests();
  }, []);

  // ← UPDATED: Better loading management
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching incoming requests...");
      console.log("Fetching sent requests...");

      // Fetch all data in parallel
      const [sentRequestsData, incomingRequestsData] = await Promise.all([
        getSentRequests(currentUserId),
        getIncomingRequests(currentUserId),
      ]);

      setSentRequests(sentRequestsData);
      setIncomingRequests(incomingRequestsData);

      // Fetch users for requests in parallel
      const [sentUsersData, incomingUsersData] = await Promise.all([
        getUsersFromRequests(sentRequestsData, "receiver"),
        getUsersFromRequests(incomingRequestsData, "sender"),
      ]);

      setSentUsers(sentUsersData);
      setIncomingUsers(incomingUsersData);
    } catch (error) {
      console.log("Error fetching requests:", error);
      Alert.alert("Error", "Failed to load requests. Please try again.");
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // ← ADD: Pull-to-refresh handler
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      console.log("🔄 Pull-to-refresh triggered");
      await fetchRequests();
    } catch (error) {
      console.log("Error refreshing requests:", error);
      Alert.alert("Error", "Failed to refresh. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnect = async () => {
    if (!referralCode.trim()) {
      Alert.alert("Oops! 😅", "Please enter a referral code");
      return;
    }

    const receiver: User | null = await getUserByReferralCode(referralCode);

    if (!receiver?.id) {
      Alert.alert("Oops! 😅", "We cannot find anyone with this referral code.");
      return;
    }

    if (await hasPendingRequest(currentUserId, receiver.id)) {
      Alert.alert(
        "Request Already Exists! 🔄",
        "There's already a pending request between you and this user. Please wait for it to be processed."
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log(
        "Sending connection request with referral code:",
        referralCode
      );

      const newRequest: ConnectingRequest = {
        id: uuid.v4(),
        date: formatDate(new Date(), false),
        senderId: currentUserId,
        receiverId: receiver.id,
        isAccepted: false,
        status: REQUEST_STATUS.Waiting.label,
      };

      await createConnectingRequest(newRequest);
      setIsLoading(false);
      Alert.alert("Yay! 🎉", "Connection request sent successfully!");

      await fetchRequests();
      setReferralCode("");
      setActiveTab("sent");
    } catch (error) {
      console.log("Error sending connection request:", error);
      Alert.alert(
        "Oops! 😅",
        "Failed to send connection request. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      console.log("Approving request:", requestId);
      setIsLoading(true);
      await acceptRequest(requestId);
      await addFriendsByRequestId(requestId);
      setIsLoading(false);

      Alert.alert("You are now friends! 💕", "Check your friends' moods now!");
      await fetchRequests();

      const refreshedUser = await getUserById(currentUserId);
      setUser(refreshedUser);
    } catch (error) {
      console.log("Error approving request:", error);
      Alert.alert("Oops! 😅", "Failed to accept request. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      console.log("Denying request:", requestId);
      setIsLoading(true);
      await denyRequest(requestId);
      setIsLoading(false);

      Alert.alert(
        "Denied Request 👋",
        "You can still send them a request in the future!"
      );
      await fetchRequests();
    } catch (error) {
      console.log("Error denying request:", error);
      Alert.alert("Oops! 😅", "Failed to deny request. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendRequest = async (requestId: string) => {
    try {
      console.log("Resending request:", requestId);
      setIsLoading(true);
      await resendDeniedRequest(requestId);
      setIsLoading(false);

      Alert.alert("Resent! 🔄", "Let's wait for the other user to respond!");
      await fetchRequests();
    } catch (error) {
      console.log("Error resending request:", error);
      Alert.alert("Oops! 😅", "Failed to resend request. Please try again.");
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(243, 180, 196, 0.8)" />
        <Text style={styles.loadingText}>Loading connections...</Text>
      </View>
    );
  }

  const renderIncomingRequest = (request: ConnectingRequest) => {
    const sender = incomingUsers.find((user) => user.id === request.senderId);

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{sender?.name || "none"}</Text>
            <Text style={styles.userHandle}>@{sender?.username || "none"}</Text>
          </View>
          <Text style={styles.requestDate}>{request.date || "No Date"}</Text>
        </View>

        {request.status === REQUEST_STATUS.Waiting.label ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => request.id && handleApproveRequest(request.id)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.approveButtonText}>Accept 💕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.denyButton]}
              onPress={() => request.id && handleDenyRequest(request.id)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.denyButtonText}>Deny 👋</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {getRequestStatusIcon(request.status)}{" "}
              {getRequestStatusLabel(request.status)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSentRequest = (request: ConnectingRequest) => {
    const receiver = sentUsers.find((user) => user.id === request.receiverId);

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{receiver?.name || "none"}</Text>
            <Text style={styles.userHandle}>
              @{receiver?.username || "none"}
            </Text>
          </View>
          <Text style={styles.requestDate}>{request.date || "No Date"}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {getRequestStatusIcon(request.status)}{" "}
            {getRequestStatusLabel(request.status)}
          </Text>

          {request.status === REQUEST_STATUS.Denied.label && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => request.id && handleResendRequest(request.id)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.resendButtonText}>Resend 🔄</Text>
            </TouchableOpacity>
          )}

          {request.status === REQUEST_STATUS.Waiting.label && (
            <TouchableOpacity
              style={[
                styles.resendButton,
                {
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "rgba(243, 180, 196, 0.6)",
                },
              ]}
              onPress={() => {
                Alert.alert(
                  "Delete Request",
                  "Are you sure you want to delete this request?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          setIsLoading(true);
                          if (request.id) {
                            await deleteRequest(request.id);
                          }
                          setIsLoading(false);
                          Alert.alert(
                            "Deleted",
                            "Your request has been deleted."
                          );
                          await fetchRequests();
                        } catch (error) {
                          setIsLoading(false);
                          Alert.alert("Error", "Failed to delete request.");
                        }
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  { color: "rgba(93, 22, 40, 0.7)" },
                ]}
              >
                Delete ❌
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
        // ← ADD: RefreshControl
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["rgba(243, 180, 196, 0.8)"]} // Android
            tintColor="rgba(243, 180, 196, 0.8)" // iOS
            title="Pull to refresh" // iOS
            titleColor="rgba(93, 22, 40, 0.7)" // iOS
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Connect Friends</Text>
          <Text style={styles.subtitle}>Build your circle of support! 💫</Text>
        </View>

        {/* Referral Code Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Add New Friend 🌸</Text>
          <View style={styles.inputGroup}>
            <TextInput
              value={referralCode}
              onChangeText={setReferralCode}
              style={styles.input}
              placeholder="Enter friend's referral code"
              placeholderTextColor="rgba(93, 22, 40, 0.4)"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[
                styles.connectButton,
                isLoading && styles.connectButtonDisabled,
              ]}
              onPress={handleConnect}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="rgba(93, 22, 40, 0.9)" />
              ) : (
                <Text style={styles.connectButtonText}>Connect 💕</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "incoming" && styles.activeTab]}
            onPress={() => setActiveTab("incoming")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "incoming" && styles.activeTabText,
              ]}
            >
              Incoming ({incomingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "sent" && styles.activeTab]}
            onPress={() => setActiveTab("sent")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "sent" && styles.activeTabText,
              ]}
            >
              Sent ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <View style={styles.requestsContainer}>
          {activeTab === "incoming" ? (
            incomingRequests.length > 0 ? (
              incomingRequests.map(renderIncomingRequest)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No incoming requests 📭
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  When someone sends you a connection request, it will appear
                  here!
                </Text>
              </View>
            )
          ) : sentRequests.length > 0 ? (
            sentRequests.map(renderSentRequest)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No sent requests 📤</Text>
              <Text style={styles.emptyStateSubtext}>
                Start connecting with friends by entering their referral code
                above!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },

  container: {
    flex: 1,
  },

  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 20,
  },

  loadingText: {
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "FredokaSemiBold",
    marginTop: 16,
  },

  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    textAlign: "center",
  },

  // ← ADD: Pull hint styles
  pullHint: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  inputSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 16,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  input: {
    flex: 1,
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "Fredoka",
    minHeight: 50,
  },

  connectButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  connectButtonDisabled: {
    backgroundColor: "rgba(243, 180, 196, 0.4)",
    shadowOpacity: 0,
  },

  connectButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "FredokaSemiBold",
  },

  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 20,
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
  },

  activeTab: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
  },

  activeTabText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontWeight: "600",
    fontFamily: "FredokaSemiBold",
  },

  requestsContainer: {
    paddingHorizontal: 24,
  },

  requestCard: {
    backgroundColor: "rgba(243, 180, 196, 0.05)",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 2,
  },

  userHandle: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
  },

  requestDate: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  approveButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
  },

  denyButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.6)",
  },

  resendButton: {
    backgroundColor: "rgba(243, 180, 196, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },

  approveButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "FredokaSemiBold",
  },

  denyButtonText: {
    color: "rgba(93, 22, 40, 0.7)",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Fredoka",
  },

  resendButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Fredoka",
  },

  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "Fredoka",
    fontWeight: "500",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 8,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    textAlign: "center",
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 60,
  },
});
