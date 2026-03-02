import { eq } from "drizzle-orm";
import { db } from "../../../../db/client";
import { users } from "../../../../db/schema";
import { newUserFormAdminSchema } from "./schema";
import z from "zod";

type NewUserForm = z.infer<typeof newUserFormAdminSchema>;

export const getAllUsersAdmin = async () => {
  try {
    const users = await db.query.users.findMany();
    return users ?? [];
  } catch (error) {
    console.error("Failed to get all users", error);
    return [];
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user ?? null;
  } catch (error) {
    console.error("Failed to get user by id", error);
    return null;
  }
};

export const createNewUser = async (formData: NewUserForm) => {
  return await db
    .insert(users)
    .values({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
    })
    .onConflictDoNothing({ target: users.id });
};

export const deleteUserById = async (userId: string) => {
  return await db.delete(users).where(eq(users.id, userId)).returning();
};
