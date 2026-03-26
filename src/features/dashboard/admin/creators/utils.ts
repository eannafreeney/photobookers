import { Creator } from "../../../../db/schema";

export const getFormValues = (creator: Creator) => {
  return JSON.stringify({
    displayName: creator?.displayName,
    bio: creator?.bio,
    city: creator?.city,
    tagline: creator?.tagline,
    country: creator?.country,
    website: creator?.website,
    facebook: creator?.facebook,
    twitter: creator?.twitter,
    instagram: creator?.instagram,
    type: creator?.type ?? "artist",
    email: creator?.email,
  });
};
