function rowToBookFormData(row, creatorType) {
  const base = {
    title: row.title,
    description: row.description || void 0,
    release_date: row.release_date || void 0,
    tags: row.tags || void 0,
    purchase_link: row.purchase_link || void 0,
    availability_status: row.availability_status,
    send_email_to_followers_on_release: false
  };
  if (creatorType === "publisher") {
    return {
      ...base,
      intent: "publisher",
      new_artist_name: row.artist
    };
  }
  return {
    ...base,
    intent: "artist",
    new_publisher_name: row.publisher || void 0
  };
}
export {
  rowToBookFormData
};
