import axios from "axios";
import { Message } from "@/types";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  oldestMessageId?: string;
}

export interface CreateMessageDto {
  content?: string;
  media?: string;
}

export const messagesService = {
  async getMessages(params?: {
    limit?: number;
    oldestMessageId?: string;
  }): Promise<GetMessagesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.oldestMessageId) {
      queryParams.append("oldestMessageId", params.oldestMessageId);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/messages?${queryString}` : "/messages";
    const response = await api.get<GetMessagesResponse>(url);

    return {
      ...response.data,
      messages: response.data.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    };
  },

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const response = await api.post<Message>("/messages", dto);
    
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
  },
};
