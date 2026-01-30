import sanitizeHtml from "sanitize-html";
import { Context } from "hono";
import { AuthUser } from "../types";
import { books } from "./db/schema";
import { db } from "./db/client";
import { eq } from "drizzle-orm";

export const formatDate = (dateString: string): string => {
  const d = new Date(dateString);

  const month = d.toLocaleString("en-US", { month: "long" }); // "April"
  const year = d.getFullYear(); // 1925

  return `${month}, ${year}`;
};

export const slugify = (title: string, artist?: string) =>
  `${title}${artist ? `-${artist}` : ""}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

export async function generateUniqueBookSlug(
  title: string,
  artistName?: string
): Promise<string> {
  let baseSlug = slugify(title, artistName);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists, append number if needed
  while (true) {
    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.slug, slug))
      .limit(1);

    if (existing.length === 0) {
      return slug; // Slug is unique
    }

    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export function getUser(c: Context): Promise<AuthUser> {
  return c.get("user");
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

type FlashType = "success" | "danger" | "info";

export async function setFlash(c: Context, type: FlashType, message: string) {
  const session = c.get("session");
  const currentData = (await session.get()) || {};
  await session.update({
    ...currentData,
    flash: { type, message },
  });
}

export async function getFlash(c: Context) {
  const session = c.get("session");
  const data = await session.get();
  const flash = data?.flash;

  // Check if this is an AJAX request
  const isAjax =
    c.req.header("X-Alpine-Request") === "true" ||
    c.req.header("Accept")?.includes("application/json");

  // Only consume flash on full page requests, not AJAX requests
  // This allows the flash to persist through AJAX redirects

  if (flash && !isAjax) {
    const currentData = data || {};
    const { flash: _, ...rest } = currentData;
    await session.update(rest);
    await session.delete("flash");
  }
  return flash;
}

export const getInputIcon = (type: string = "text") => {
  const iconProps = {
    class: "h-[1em] opacity-50",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
  };

  const strokeProps = {
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    strokeWidth: "2.5",
    fill: "none",
    stroke: "currentColor",
  };

  switch (type) {
    case "email":
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </g>
        </svg>
      );
    case "password":
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
          </g>
        </svg>
      );
    case "url":
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </g>
        </svg>
      );
    case "search":
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </g>
        </svg>
      );
    case "number":
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <path d="M4 9h16"></path>
            <path d="M4 15h16"></path>
            <path d="M10 3v18"></path>
            <path d="M14 3v18"></path>
          </g>
        </svg>
      );
    case "date":
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
            />
          </g>
        </svg>
      );
    default: // text
      return (
        <svg {...iconProps}>
          <g {...strokeProps}>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </g>
        </svg>
      );
  }
};

export const getRandomCoverUrl = () => {
  return `https://static.photos/abstract/1024x576.jpg${
    Math.floor(Math.random() * 999) + 1
  }`;
};
