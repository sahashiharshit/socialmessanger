export interface Message {
  message: string;
  userId: string;
  username: string;
  timestamp: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}