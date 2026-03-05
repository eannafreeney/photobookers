import { Creator } from "./src/db/schema";
import type { Child } from "hono/jsx";

export type Flash = {
  type: "success" | "info" | "warning" | "danger" | "neutral";
  message: string;
};

export type ChildType = Child | Child[] | string;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  creator: Creator | null;
  isAdmin: boolean;
  mustResetPassword: boolean;
};
