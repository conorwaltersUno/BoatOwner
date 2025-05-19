import { useMutation } from "@tanstack/react-query";
import { signUp, signIn } from "@/api/fetch/users.fetch";
import { saveTokens } from "@/utils/tokenStorage";

export function useSignUp() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string; boat_name: string; boat_model: string }) => {
      const { email, password, boat_name, boat_model } = data;
      const res = await signUp(email, password, boat_name, boat_model);
      await saveTokens(res.accessToken, res.refreshToken, res.user.id, res.boat?.id);
      return res;
    },
  });
}
