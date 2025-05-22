import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  dob: string;
  referralCode: string;
  friends?: string[];
  token?: string; // Optional, for JWT
}

export interface Mood {
  id: string;
  userId: string;
  mood: string;
  description: string;
  reason: string;
  date: string;
  isPrivate: boolean;
}

