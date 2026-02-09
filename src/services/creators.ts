import { and, eq, exists, ilike, isNull } from "drizzle-orm";
import { db } from "../db/client";
import {
  books,
  Creator,
  CreatorClaim,
  creators,
  NewCreator,
  UpdateCreator,
} from "../db/schema";
import { getRandomCoverUrl, slugify } from "../utils";
import { bookFormSchema } from "../schemas";
import z from "zod";
import { AuthUser } from "../../types";

export const getCreatorBySlug = async (slug: string) => {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.slug, slug),
    with: {
      booksAsArtist: {
        where: eq(books.publicationStatus, "published"),
      },
      booksAsPublisher: {
        with: {
          artist: true,
        },
        where: eq(books.publicationStatus, "published"),
      },
    },
  });

  const uniqueArtists = creator?.booksAsPublisher
    .map((book) => book.artist)
    .filter(
      (artist, index, self) =>
        artist && self.findIndex((a) => a?.id === artist.id) === index,
    );

  return {
    creator,
    artists: uniqueArtists ?? [],
  };
};

export const getCreatorPermissionData = async (
  creatorId: string,
): Promise<Pick<Creator, "id" | "displayName"> | null> => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        displayName: true,
      },
    });
    return creator ?? null;
  } catch (error) {
    console.error("Failed to get creator permission data", error);
    return null;
  }
};

export const getCreatorById = async (creatorId: string) => {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    with: {
      booksAsArtist: true,
      booksAsPublisher: true,
    },
  });
  return creator ?? null;
};

export const getAllOptions = async (creatorType: "artist" | "publisher") => {
  const foundCreators = await db.query.creators.findMany({
    where: eq(creators.type, creatorType),
    orderBy: (creators, { asc }) => [asc(creators.sortName)],
  });
  return (
    foundCreators?.map((creator) => ({
      id: creator.id,
      label: creator.displayName,
    })) ?? []
  );
};

export const createCreatorProfile = async (input: NewCreator) => {
  try {
    const parts = input.displayName.trim().split(/\s+/);
    const sortName = parts[parts.length - 1];

    const [newCreator] = await db
      .insert(creators)
      .values({
        ...input,
        sortName,
      })
      .returning();
    return newCreator;
  } catch (error) {
    console.error("Failed to create artist", error);
    return null;
  }
};

export const updateCreatorProfile = async (
  input: UpdateCreator,
  creatorId: string,
) => {
  try {
    // Exclude fields that shouldn't be updated
    const { id, slug, ownerUserId, createdAt, ...updateableFields } =
      input as any;

    const parts = updateableFields.displayName?.trim().split(/\s+/) ?? [];
    const sortName = parts.length > 0 ? parts[parts.length - 1] : undefined;

    const cleanedInput = {
      ...updateableFields,
      sortName,
      website: updateableFields.website || null,
      facebook: updateableFields.facebook || null,
      twitter: updateableFields.twitter || null,
      instagram: updateableFields.instagram || null,
      updatedAt: new Date(),
    };

    const [updatedCreator] = await db
      .update(creators)
      .set(cleanedInput)
      .where(eq(creators.id, creatorId))
      .returning();

    return updatedCreator;
  } catch (error) {
    console.error("Failed to update artist", error);
    return null;
  }
};

export const updateCreatorCoverImage = async (
  coverUrl: string,
  creatorId: string,
) => {
  try {
    const [updatedCreator] = await db
      .update(creators)
      .set({ coverUrl })
      .where(eq(creators.id, creatorId))
      .returning();
    return updatedCreator;
  } catch (error) {
    console.error("Failed to update artist cover image", error);
    return null;
  }
};

export const getOrCreateArtist = async (
  formData: z.infer<typeof bookFormSchema>,
  user: AuthUser,
): Promise<Creator | null> => {
  // If an existing artist was selected, use it
  if (formData.artist_id) {
    const artist = await getCreatorById(formData.artist_id);
    if (!artist || artist.type !== "artist") {
      return null;
    }
    return artist;
  }

  // If a new artist name was provided, create a stub profile
  if (formData.new_artist_name) {
    const newArtist = await createStubCreatorProfile(
      formData.new_artist_name,
      user.id,
      "artist",
    );
    return newArtist;
  }

  return null;
};

export const resolveArtist = async (
  formData: { artist_id?: string; new_artist_name?: string },
  userId: string,
): Promise<Creator | null | "error"> => {
  const { artist_id, new_artist_name } = formData;

  // Using existing artist
  if (artist_id) {
    const creator = await getCreatorById(artist_id);
    return creator?.type === "artist" ? creator : "error";
  }

  // Create new stub artist
  if (new_artist_name) {
    const creator = await createStubCreatorProfile(
      new_artist_name,
      userId,
      "artist",
    );
    return creator?.type === "artist" ? creator : "error";
  }

  return null;
};

export const resolvePublisher = async (
  formData: { publisher_id?: string; new_publisher_name?: string },
  userId: string,
): Promise<Creator | null | "error"> => {
  const { publisher_id, new_publisher_name } = formData;

  // No publisher specified
  if (!publisher_id && !new_publisher_name) {
    return null;
  }

  // Using existing publisher
  if (publisher_id) {
    const creator = await getCreatorById(publisher_id);
    return creator?.type === "publisher" ? creator : "error";
  }

  // Create new stub publisher
  if (new_publisher_name) {
    const publisher = await createStubCreatorProfile(
      new_publisher_name,
      userId,
      "publisher",
    );
    return publisher?.type === "publisher" ? publisher : "error";
  }

  return null;
};

export const createStubCreatorProfile = async (
  displayName: string,
  userId: string,
  type: "publisher" | "artist",
) => {
  return await createCreatorProfile({
    displayName: displayName.trim(),
    slug: slugify(displayName),
    coverUrl: getRandomCoverUrl(),
    ownerUserId: null,
    type,
    status: "stub",
    createdByUserId: userId,
  });
};

export const getArtistsCreatedByUserId = async (
  ownerId: string,
  searchQuery?: string | null,
) => {
  try {
    const baseCondition = and(
      eq(creators.createdByUserId, ownerId),
      eq(creators.type, "artist"),
      isNull(creators.ownerUserId),
    );

    const whereClause = searchQuery
      ? and(baseCondition, ilike(books.title, `%${searchQuery}%`))
      : baseCondition;

    const artistsByOwnerId = await db.query.creators.findMany({
      where: whereClause,
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
    });

    return artistsByOwnerId;
  } catch (error) {
    console.error("Failed to get creator by slug", error);
    return null;
  }
};

export const searchCreators = async (searchQuery: string) => {
  // find creators with at least one book
  try {
    return await db.query.creators.findMany({
      where: and(
        ilike(creators.displayName, `%${searchQuery}%`),
        exists(db.select().from(books).where(eq(books.artistId, creators.id))),
      ),
      limit: 10,
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
    });
  } catch (error) {
    console.error("Failed to search creators", error);
    return [];
  }
};

export const generateClaimEmail = async (
  claim: CreatorClaim,
  creator: Creator,
  verificationUrl: string,
  verificationLink: string,
) => {
  return `
        <h2>Verify Your Creator Profile</h2>
        <p>Hi, ${creator.displayName}! </p>
        
        <h3>Your Verification Code:</h3>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 20px; background: #f5f5f5; text-align: center;">
          ${claim.verificationCode}
        </p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Add this code to your website (${verificationUrl}) in one of these ways:
            <ul>
              <li>Add it as visible text on your homepage</li>
              <li>Add the line below as a meta tag:</li>
              <li><code>&lt;meta name="photobookers-verification-code" content="${claim.verificationCode}"&gt;</code></li>
            </ul>
          </li>
          <li>Once added, click the button below to verify:</li>
          <li>Once verified, you will be able to manage your creator profile from your dashboard.</li>
        </ol>
        
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Verify My Website
          </a>
        </p>
        
        <p><small>This code expires in 7 days. If you need a new code, please submit a new claim.</small></p>
      `;
};
