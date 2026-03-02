import { Creator } from "./src/db/schema";

export type Flash = {
  type: "success" | "info" | "warning" | "danger" | "neutral";
  message: string;
};

export type ChildType = JSX.Element | JSX.Element[] | string;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  creator: Creator | null;
  isAdmin: boolean;
};
