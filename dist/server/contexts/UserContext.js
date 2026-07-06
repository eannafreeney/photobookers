import { jsx } from "hono/jsx/jsx-runtime";
import { createContext, useContext } from "hono/jsx";
const UserContext = createContext(null);
const UserProvider = ({
  user,
  children
}) => {
  return /* @__PURE__ */ jsx(UserContext.Provider, { value: { user }, children });
};
const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context.user ?? null;
};
export {
  UserProvider,
  useUser
};
