import type { HvBehavior } from "hyperview";

type AuthClient = {
  auth: {
    signOut: () => Promise<{ error: Error | null }>;
  };
};

export function createSignOutSupabaseBehavior(
  getClient: () => AuthClient,
): HvBehavior {
  return {
    action: "sign-out-supabase",
    callback: async () => {
      const { error } = await getClient().auth.signOut();
      if (error) {
        console.error("sign-out-supabase failed", error);
      }
    },
  };
}
