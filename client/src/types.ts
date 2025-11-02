export interface User {
  email: string;
  name: string;
}

export interface Message {
  id: string;
  user: User;
  content?: string;
  media?: string;
  timestamp: Date;
}
