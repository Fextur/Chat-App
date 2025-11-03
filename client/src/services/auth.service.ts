import { api } from "./api";

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
