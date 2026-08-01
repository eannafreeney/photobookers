const PERSISTED_IMAGE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function persistedBookImageIds(ids) {
  return ids.filter((id) => PERSISTED_IMAGE_ID_RE.test(id));
}
export {
  persistedBookImageIds
};
