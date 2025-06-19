export interface User {
  id?: string;
  name: string;
  username: string;
  password: string;
  dob: string;
  referralCode: string;
  friends?: string[];
}

// Location interface
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string; // Location name (e.g., "Starbucks Coffee", "Home", etc.)
}

export interface Mood {
  id: string;
  userId: string;
  mood: string;
  description: string;
  reason: string;
  date: string;
  isPrivate: boolean;
  imageUrl?: string;
  hasImage?: boolean;
  location?: LocationData; // ← ADD: Optional location data
  hasLocation?: boolean;   // ← ADD: Flag to indicate if mood has location
}

export interface ConnectingRequest {
  id?: string;
  senderId: string;
  receiverId: string;
  isAccepted: boolean;
  status: string;
  date: string;
}

// For Pin on Map
export interface FriendMoodPin {
  friend: User;
  mood: Mood;
  location: LocationData;
}