import { ContentfulStatusCode } from "hono/utils/http-status";
import Alert from "../components/app/Alert";
import { Context } from "hono";

export const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
  errorCode: ContentfulStatusCode = 422,
) => c.html(<Alert type="danger" message={errorMessage} />, errorCode);

export const showSuccessAlert = (
  c: Context,
  errorMessage: string = "Action Complete!",
) => c.html(<Alert type="success" message={errorMessage} />);
