export function isMobile(userAgent: string): "mobile" | "desktop" {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
    userAgent,
  );
  if (isMobile) {
    return "mobile";
  }
  return "desktop";
}
