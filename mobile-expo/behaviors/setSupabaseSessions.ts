import type { HvBehavior } from "hyperview";

type AuthClient = {
  auth: {
    setSession: (session: {
      access_token: string;
      refresh_token: string;
    }) => Promise<{ error: Error | null }>;
  };
};

export function createSetSupabaseSessionBehavior(
  getClient: () => AuthClient,
): HvBehavior {
  return {
    action: "set-supabase-session",
    callback: async (element) => {
      const accessToken = element.getAttribute("access-token");
      const refreshToken = element.getAttribute("refresh-token");
      if (!accessToken || !refreshToken) {
        console.warn("set-supabase-session: missing tokens");
        return;
      }

      const { error } = await getClient().auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error("set-supabase-session failed", error);
      }
    },
  };
}
