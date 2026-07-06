const processTags = (tagsString) => {
  if (!tagsString) return [];
  return tagsString.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
};
export {
  processTags
};
