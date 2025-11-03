import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";
import { authService } from "@/services/auth.service";

export const useUser = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authService.getMe();
      return response.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: data as User | undefined,
    isAuthenticated: !!data && !error,
    isLoading,
    refetch,
  };
};
