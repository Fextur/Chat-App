import { User } from "@/types";

// TODO
const CURRENT_USER: User = {
  email: "alice@example.com",
  name: "Alice Smith",
};

export const useUser = () => {
  return {
    user: CURRENT_USER,
    isAuthenticated: true,
    isLoading: false,
  };
};
