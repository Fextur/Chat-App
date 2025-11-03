import { api } from './api';
import { Message } from '@/types';

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
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.oldestMessageId) {
      queryParams.append('oldestMessageId', params.oldestMessageId);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/messages?${queryString}` : '/messages';
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
    const response = await api.post<Message>('/messages', dto);

    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{ url: string }>(
      '/messages/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.url;
  },

  async requestAIAssistance(): Promise<Message> {
    const response = await api.post<Message>('/messages/ai-assistance');

    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
  },
};
