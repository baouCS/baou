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
  date: string;
}

export interface Post {
  docId: string;
  id: number;
  text: string;
  status: string;
  bgColor: string;
  date: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  image?: File | null;
}
