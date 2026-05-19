export type AccountFeatureRow = {
  name: string;
  fan: boolean;
  artist: boolean;
  publisher: boolean;
};

export const accountFeatures: AccountFeatureRow[] = [
  {
    name: "Follow Artists + Publishers",
    fan: true,
    artist: true,
    publisher: true,
  },
  { name: "Wishlist Books", fan: true, artist: true, publisher: true },
  {
    name: "Add Books to Collection",
    fan: true,
    artist: true,
    publisher: true,
  },
  { name: "View Your Feed", fan: true, artist: true, publisher: true },
  { name: "View Your Profile", fan: true, artist: true, publisher: true },
  { name: "Upload Your Books", fan: false, artist: true, publisher: true },
  { name: "Manage Your Books", fan: false, artist: true, publisher: true },
];

export const accountMobileCards = [
  {
    type: "Fan" as const,
    slug: "fan",
    features: accountFeatures.filter((f) => f.fan),
  },
  {
    type: "Artist / Self-Publisher" as const,
    slug: "artist",
    features: accountFeatures.filter((f) => f.artist),
  },
  {
    type: "Publisher" as const,
    slug: "publisher",
    features: accountFeatures.filter((f) => f.publisher),
  },
];
