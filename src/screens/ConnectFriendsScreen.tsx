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
  const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming"); // "incoming" or "sent" tab is being selected
  const [incomingRequests, setIncomingRequests] = useState<ConnectingRequest[]>(
    []
  );
  const [incomingUsers, setIncomingUsers] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectingRequest[]>([]);
  const [sentUsers, setSentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuth();

  // get current ID to filter requests
  const currentUserId = user?.id || "";

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch incoming/sent requests of current user
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching incoming requests...");
      console.log("Fetching sent requests...");

      // Load all sent requests and corresponding users for this screen
      const sentRequests = await getSentRequests(currentUserId);
      setSentRequests(sentRequests);

      // Get all receivers to load their information on request list
      setSentUsers(await getUsersFromRequests(sentRequests, "receiver"));

      // Load all incoming requests and corresponding users for this screen
      const incomingRequests = await getIncomingRequests(currentUserId);
      setIncomingRequests(incomingRequests);

      // Get all sender to load their information on request list
      setIncomingUsers(await getUsersFromRequests(incomingRequests, "sender"));

      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching requests:", error);
      setIsLoading(false);
    }
  };

  // Create Connect Request With Appropriate Code
  const handleConnect = async () => {
    if (!referralCode.trim()) {
      Alert.alert("Oops! 😅", "Please enter a referral code");
      return;
    }

    console.log(referralCode);
    // Get info of receiver
    const receiver: User | null = await getUserByReferralCode(referralCode);

    // Ensure this receiver exists
    if (!receiver?.id) {
      Alert.alert("Oops! 😅", "We cannot find anyone with this referral code.");
      return;
    }

    // Check if there's already a pending request between these users
    if (await hasPendingRequest(currentUserId, receiver.id)) {
      Alert.alert(
        "Request Already Exists! 🔄",
        "There's already a pending request between you and this user. Please wait for it to be processed."
      );
      return;
    }

    // Proceed to create request when everything passed validation
    try {
      setIsLoading(true);
      console.log(
        "Sending connection request with referral code:",
        referralCode
      );

      // Create a new Request
      const newRequest: ConnectingRequest = {
        id: uuid.v4(),
        date: formatDate(new Date(), false),
        senderId: currentUserId,
        receiverId: receiver.id,
        isAccepted: false,
        status: REQUEST_STATUS.Waiting.label, // waiting as intiated
      };

      // Call API
      await createConnectingRequest(newRequest);
      setIsLoading(false);
      Alert.alert("Yay! 🎉", "Connection request sent successfully!");

      // Refresh page and reset referral code
      await fetchRequests();
      setReferralCode("");

      // Switch tab to sent request
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

  // Action when user accept a request
  const handleApproveRequest = async (requestId: string) => {
    try {
      console.log("Approving request:", requestId);
      // Change status of current request
      setIsLoading(true);
      await acceptRequest(requestId);

      // Add receiverId/senderId to list of friends of current user
      await addFriendsByRequestId(requestId);
      setIsLoading(false);

      Alert.alert("You are now friends! 💕", "Check your friends' moods now!");

      //refresh screen
      await fetchRequests();

      // Refresh user info to reload new friend list
      const refreshedUser = await getUserById(currentUserId);
      setUser(refreshedUser);
      
    } catch (error) {
      console.log("Error approving request:", error);
      Alert.alert("Oops! 😅", "Failed to accept request. Please try again.");
    }
  };

  // Action when user denied a request
  const handleDenyRequest = async (requestId: string) => {
    try {
      console.log("Denying request:", requestId);

      // Change status of current request - denied
      setIsLoading(true);
      await denyRequest(requestId);
      setIsLoading(false);

      Alert.alert(
        "Denied Request 👋",
        "You can still send them a request in the future!"
      );

      //refresh screen
      await fetchRequests();
    } catch (error) {
      console.log("Error denying request:", error);
      Alert.alert("Oops! 😅", "Failed to deny request. Please try again.");
    }
  };

  // Let a user resend their sent request if that request is denied
  const handleResendRequest = async (requestId: string) => {
    try {
      console.log("Resending request:", requestId);

      // change request status
      setIsLoading(true);
      await resendDeniedRequest(requestId);
      setIsLoading(false);

      Alert.alert("Resent! 🔄", "Let's wait for the other user to respond!");

      //refresh screen
      await fetchRequests();
    } catch (error) {
      console.log("Error resending request:", error);
      Alert.alert("Oops! 😅", "Failed to resend request. Please try again.");
    }
  };

  // To show 1 incoming request card
  const renderIncomingRequest = (request: ConnectingRequest) => {
    // find the corresponding sender in sender list to display
    console.log('incomingUsers: ', incomingUsers);
    const sender = incomingUsers.find((user) => user.id === request.senderId);
    console.log(sender);

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{sender?.name || "none"}</Text>
            <Text style={styles.userHandle}>@{sender?.username || "none"}</Text>
          </View>
          <Text style={styles.requestDate}>
            {request.date || "No Date"}
          </Text>
        </View>

        {/* If request is on waitlist, show action buttons (accept/deny) */}
        {request.status === REQUEST_STATUS.Waiting.label ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveRequest(request.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.approveButtonText}>Accept 💕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.denyButton]}
              onPress={() => handleDenyRequest(request.id)}
              activeOpacity={0.8}
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

  // To show 1 sent request card
  const renderSentRequest = (request: ConnectingRequest) => {
    // find the corresponding receiver in receiver list to display
    console.log('sentUsers: ', sentUsers);
    const receiver = sentUsers.find((user) => user.id === request.receiverId);
    console.log('receiver: ', receiver);

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{receiver?.name || "none"}</Text>
            <Text style={styles.userHandle}>
              @{receiver?.username || "none"}
            </Text>
          </View>
          <Text style={styles.requestDate}>
            {request.date  || "No Date"}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {getRequestStatusIcon(request.status)}{" "}
            {getRequestStatusLabel(request.status)}
          </Text>

          {/* If sent request was denied, allow user to resend that request */}
          {request.status === REQUEST_STATUS.Denied.label && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => handleResendRequest(request.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.resendButtonText}>Resend 🔄</Text>
            </TouchableOpacity>
          )}

          {/* If sent request is still in waiting status, allow user to delete that request */}
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
                          await deleteRequest(request.id);
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

  // Main Component
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
              style={styles.connectButton}
              onPress={handleConnect}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.connectButtonText}>
                {isLoading ? "Sending..." : "Connect 💕"}
              </Text>
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
    elevation: 3,
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
    elevation: 2,
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
