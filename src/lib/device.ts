import { useSyncExternalStore } from "hono/jsx";

export function isMobile(userAgent: string): "mobile" | "desktop" {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
    userAgent,
  );
  if (isMobile) {
    return "mobile";
  }
  return "desktop";
}

export const getIsMobile = () => {
  return typeof window !== "undefined"
    ? window.matchMedia("(max-width: 767px)").matches
    : false;
};

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
