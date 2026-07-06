import { creators } from "../db/schema.js";
const CREATOR_CARD_COLUMNS = {
  id: true,
  displayName: true,
  slug: true,
  coverUrl: true,
  status: true,
  type: true,
  city: true,
  country: true,
  tagline: true,
  email: true,
  instagram: true
};
const CREATOR_CARD_SELECT = {
  id: creators.id,
  displayName: creators.displayName,
  slug: creators.slug,
  coverUrl: creators.coverUrl,
  status: creators.status,
  type: creators.type,
  city: creators.city,
  country: creators.country,
  tagline: creators.tagline,
  email: creators.email,
  instagram: creators.instagram
};
const BOOK_CARD_COLUMNS = {
  id: true,
  title: true,
  slug: true,
  coverUrl: true,
  artistId: true,
  publisherId: true,
  releaseDate: true,
  tags: true,
  createdByUserId: true
};
export {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  CREATOR_CARD_SELECT
};
