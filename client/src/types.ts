export interface Message {
  id: string;
  user: string;
  content: string;
  media?: string;
  timestamp: Date;
}

export interface User {
  email: string;
  name: string;
}
