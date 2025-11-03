import axios from "axios";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

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

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(idToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse & { accessToken?: string }>(
      "/auth/login",
      { idToken }
    );
    if (response.data.accessToken) {
      setToken(response.data.accessToken);
    }
    return response.data;
  },

  async getMe(): Promise<MeResponse> {
    const response = await api.get<MeResponse>("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
    removeToken();
  },
};
