import { db } from "../db/client";
import { Creator } from "../db/schema";

export const getAllCreatorProfilesAdmin = async (): Promise<Creator[]> => {
  return await db.query.creators.findMany();
};
