import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/api/fetch/users.fetch";
import { saveTokens } from "@/utils/tokenStorage";

export function useSignIn() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { email, password } = data;
      const res = await signIn(email, password);
      await saveTokens(res.accessToken, res.refreshToken, res.userId, res.boatId);
      return res;
    },
  });
}
