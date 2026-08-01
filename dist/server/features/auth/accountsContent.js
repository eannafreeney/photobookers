const accountFeatures = [
  {
    name: "Follow Artists + Publishers",
    fan: true,
    artist: true,
    publisher: true
  },
  { name: "Favourite Books", fan: true, artist: true, publisher: true },
  {
    name: "Share Your Public Shelf",
    fan: true,
    artist: false,
    publisher: false
  },
  {
    name: "Publish Posts",
    fan: true,
    artist: true,
    publisher: true
  },
  { name: "View Your Feed", fan: true, artist: true, publisher: true },
  { name: "Upload Your Books", fan: false, artist: true, publisher: true },
  { name: "Manage Your Books", fan: false, artist: true, publisher: true }
];
const accountMobileCards = [
  {
    type: "Collector",
    slug: "fan",
    features: accountFeatures.filter((f) => f.fan)
  },
  {
    type: "Artist / Self-Publisher",
    slug: "artist",
    features: accountFeatures.filter((f) => f.artist)
  },
  {
    type: "Publisher",
    slug: "publisher",
    features: accountFeatures.filter((f) => f.publisher)
  }
];
export {
  accountFeatures,
  accountMobileCards
};
