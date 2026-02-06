import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { supabaseAdmin } from "../lib/supabase";
import { db } from "../db/client";
import { creators, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "../../types";


export async function checkIncompleteCreatorSignup(c: Context, user: AuthUser) {
  // Check if user has an intended creator type but no creator profile
  if (!user) return null;
  
  // First check the database field (primary source)
  let intendedType = user.intendedCreatorType;
  
  // If user has an intended creator type but no creator profile, redirect them
  if (intendedType && (intendedType === "artist" || intendedType === "publisher") && !user.creator) {
    return c.redirect(`/dashboard/creators/new?type=${intendedType}`);
  }
  
  return null;
}

// Helper to refresh access token using refresh token
async function refreshAccessToken(refreshToken: string, c?: Context) {
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      // Clear invalid refresh token cookie if context is provided
      if (c) {
        deleteCookie(c, "refresh_token");
        deleteCookie(c, "token");
      }
      return null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

// Helper to get user from token
async function getUserFromToken(token: string) {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return null;

    // Get full user data from your table
    try {
      const [[dbUser], [creatorProfile]] = await Promise.all([
        db.select().from(users).where(eq(users.id, user.id)),
        db.select().from(creators).where(eq(creators.ownerUserId, user.id)),
      ]);

      if (!dbUser) return null;

      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        creator: creatorProfile || null,
        intendedCreatorType: dbUser.intendedCreatorType, 

      };
    } catch (dbError: any) {
      // Handle database connection errors
      console.error("Database connection error:", dbError);

      // Check if it's a connection/DNS error
      if (
        dbError?.cause?.code === "ENOTFOUND" ||
        dbError?.code === "ENOTFOUND" ||
        dbError?.message?.includes("getaddrinfo") ||
        dbError?.message?.includes("ENOTFOUND")
      ) {
        console.error(
          "Database hostname cannot be resolved. Please check your DATABASE_URL environment variable."
        );
      }

      // Return null to allow the request to continue (for optional auth)
      // The app can handle the missing user gracefully
      return null;
    }
  } catch (error: any) {
    // Handle Supabase auth errors
    console.error("Auth error:", error);
    return null;
  }
}

// REQUIRED auth - redirects to login if not authenticated
export const requireAuth = async (c: Context, next: Next) => {
  let token = getCookie(c, "token");
  let refreshToken = getCookie(c, "refresh_token");

  // If no token but we have a refresh token, try to refresh
  if (!token && refreshToken) {
    const refreshedToken = await refreshAccessToken(refreshToken, c);
    if (refreshedToken) {
      setCookie(c, "token", refreshedToken.access_token, {
        httpOnly: true,
        maxAge: refreshedToken.expires_in,
        path: "/",
      });
      setCookie(c, "refresh_token", refreshedToken.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      token = refreshedToken.access_token; 
      refreshToken = refreshedToken.refresh_token;
    }
  }

  if (!token) {
    return c.redirect("/auth/login");
  }

  let user = await getUserFromToken(token);

  // If token is invalid/expired but we have a refresh token, try to refresh
  if (!user && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, c);
    if (refreshed) {
      setCookie(c, "token", refreshed.access_token, {
        httpOnly: true,
        maxAge: refreshed.expires_in,
        path: "/",
      });
      setCookie(c, "refresh_token", refreshed.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      user = await getUserFromToken(refreshed.access_token);
    }
  }

  if (!user) {
    // Clear invalid cookies
    deleteCookie(c, "token");
    deleteCookie(c, "refresh_token");
    return c.redirect("/auth/login");
  }

  // Attach user to context
  c.set("user", user);

  // Check for incomplete creator signup (but allow dashboard routes to handle their own redirects)
  const path = c.req.path;
  if (
    !path.startsWith("/dashboard/creators/new") && 
    !path.startsWith("/auth/") &&
    !path.startsWith("/api/")
  ) {
    const redirect = await checkIncompleteCreatorSignup(c, user);
    if (redirect) return redirect;
  }

  await next();
};

// OPTIONAL auth - loads user if logged in, continues either way
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  let token = getCookie(c, "token");
  let refreshToken = getCookie(c, "refresh_token");

  // If no token but we have a refresh token, try to refresh
  if (!token && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, c);
    if (refreshed) {
      setCookie(c, "token", refreshed.access_token, {
        httpOnly: true,
        maxAge: refreshed.expires_in,
        path: "/",
      });
      setCookie(c, "refresh_token", refreshed.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
    }
  }

  let user = token ? await getUserFromToken(token) : null;

  // If token is invalid/expired but we have a refresh token, try to refresh
  if (!user && token && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, c);
    if (refreshed) {
      setCookie(c, "token", refreshed.access_token, {
        httpOnly: true,
        maxAge: refreshed.expires_in,
        path: "/",
      });
      setCookie(c, "refresh_token", refreshed.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      token = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      user = await getUserFromToken(refreshed.access_token);
    }
  }

  if (token && !user) {
    deleteCookie(c, "token");
    deleteCookie(c, "refresh_token");
     
  }

  if (!user) {
    return c.redirect("/auth/login");
  }

  c.set("user", user);
  
  const path = c.req.path;
   // Only check for incomplete signup if NOT already on the creator form page or auth pages
   if (
    !path.startsWith("/dashboard/creators/new") && 
    !path.startsWith("/auth/") &&
    !path.startsWith("/api/")
  ) {
    const redirect = await checkIncompleteCreatorSignup(c, user);
    if (redirect) return redirect;
  }

  await next();
};

export async function login(c: Context, email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return error.message;
  }

  // Store access token (short-lived)
  setCookie(c, "token", data.session.access_token, {
    httpOnly: true,
    maxAge: data.session.expires_in,
    path: "/",
  });

  // Store refresh token (long-lived, e.g., 7 days)
  setCookie(c, "refresh_token", data.session.refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}
