import { Creator } from "./src/db/schema";

export type Flash = {
  type: "success" | "error" | "info";
  message: string;
};

export type ChildType = JSX.Element | JSX.Element[] | string;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  intendedCreatorType: "artist" | "publisher" | null;
  creator: Creator | null;
};
