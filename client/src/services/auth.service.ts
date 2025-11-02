import axios from "axios";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface AuthUser {
  email: string;
  name: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

export const authService = {
  async login(idToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", { idToken });
    return response.data;
  },

  async getMe(): Promise<MeResponse> {
    const response = await api.get<MeResponse>("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
