
export interface User {
  id?: string;
  name: string;
  username: string;
  password: string;
  dob: string;
  referralCode: string;
  friends?: string[];
}

export interface Mood {
  id: string;
  userId: string;
  mood: string;
  description: string;
  reason: string;
  date: string;
  isPrivate: boolean;
  imageUrl?: string;     // ← ADD THIS - URL của ảnh từ Firebase Storage
  hasImage?: boolean; 
}

export interface ConnectingRequest {
  id?: string;
  senderId: string;
  receiverId: string;
  isAccepted: boolean;
  status: string;
  date: string;
}

