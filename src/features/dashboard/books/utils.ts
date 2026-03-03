export const processTags = (tagsString?: string): string[] => {
  if (!tagsString) return [];
  return tagsString
    .split(",")
    .map((t: string) => t.trim().toLowerCase())
    .filter((t: string) => t.length > 0);
};
