import { Context, Hono } from "hono";
import Alert from "../components/app/Alert";
import { getUser } from "../utils";
import AdminDashboard from "../components/admin/AdminDashboard";

export const adminDashboardRoutes = new Hono();

export const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
) => c.html(<Alert type="danger" message={errorMessage} />, 422);

adminDashboardRoutes.get("/", async (c) => {
  const user = await getUser(c);
  return c.html(<AdminDashboard user={user} />);
});
