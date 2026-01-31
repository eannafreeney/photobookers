import { createContext, useContext } from "hono/jsx";
import { AuthUser } from "../../types";

type UserContextType = {
  user?: AuthUser | null;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
  user,
  children,
}: {
  user?: AuthUser | null;
  children: any;
}) => {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context.user ?? null;
};
