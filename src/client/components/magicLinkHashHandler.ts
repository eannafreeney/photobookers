import Alpine from "alpinejs";

export function registerMagicLinkHashHandler() {
  Alpine.data("magicLinkHashHandler", () => ({
    init() {
      const hash =
        typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      if (!hash) {
        window.location.replace("/auth/login");
        return;
      }
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token") ?? "";
      const expires_in =
        parseInt(params.get("expires_in") ?? "3600", 10) || 3600;

      if (!access_token) {
        window.location.replace("/auth/login");
        return;
      }

      fetch("/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token,
          refresh_token,
          expires_in,
        }),
        credentials: "same-origin",
      })
        .then((res) => {
          if (res.ok) {
            window.location.replace("/auth/force-reset-password");
          } else {
            window.location.replace("/auth/login");
          }
        })
        .catch(() => {
          window.location.replace("/auth/login");
        });
    },
  }));
}
