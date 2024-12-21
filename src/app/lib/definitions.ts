import { Timestamp } from "firebase/firestore";

export interface signupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  message: string;
  error: boolean;
  status: number | string;
}
export interface Comment {
  author: string;
  text: string;
  date: Timestamp;
}

export interface Post {
  docId: string;
  id: number;
  text: string;
  status: string;
  bgColor: string;
  date: Timestamp;
  likes: number;
  dislikes: number;
  comments: Comment[];
  image?: File | null;
  reactions?: { [userId: string]: "like" | "dislike" };
}
