import Alert from "../components/app/Alert";
import { Context } from "hono";

export const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
) => c.html(<Alert type="danger" message={errorMessage} />, 422);
