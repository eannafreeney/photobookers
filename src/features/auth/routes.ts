import { Hono } from "hono";
import {
  getAccountsPage,
  getSetNewPasswordPage,
  getLoginPage,
  getRegisterPage,
  getResetPasswordModal,
  login,
  logout,
  registerCreator,
  registerFan,
  resetPassword,
  setSession,
  validateDisplayName,
  validateEmail,
  validateWebsite,
  processRegister,
  resendVerificationEmail,
} from "./controllers";
import { redirectUrlSchema } from "../../schemas";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../lib/validator";
import {
  loginFormSchema,
  processRegisterQuerySchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resetPasswordFormSchema,
} from "./schema";

export const authRoutes = new Hono();
// ---------- Pages (GET) ----------
authRoutes.get("/accounts", getAccountsPage);
authRoutes.get("/login", getLoginPage);
authRoutes.get("/register", getRegisterPage);
authRoutes.get("/force-reset-password", getSetNewPasswordPage);
authRoutes.get("/reset-password", getResetPasswordModal);

// ---------- Auth flow (GET/POST) ----------

authRoutes.post("/logout", logout);
authRoutes.post(
  "/login",
  paramValidator(redirectUrlSchema),
  formValidator(loginFormSchema),
  login,
);
authRoutes.post(
  "/register-fan",
  paramValidator(redirectUrlSchema),
  formValidator(registerFanFormSchema),
  registerFan,
);
authRoutes.post(
  "/register-creator",
  formValidator(registerCreatorFormSchema),
  registerCreator,
);
authRoutes.get(
  "/callback",
  queryValidator(processRegisterQuerySchema),
  processRegister,
);
authRoutes.post(
  "/reset-password",
  formValidator(resetPasswordFormSchema),
  resetPassword,
);
authRoutes.post("/set-session", setSession);

// ---------- Validation (POST) ----------
authRoutes.post("/validate/email", validateEmail);
authRoutes.post("/validate/display-name", validateDisplayName);
authRoutes.post("/validate/website", validateWebsite);

// ---------- Resend Verification Email (POST) ----------
authRoutes.post("/resend-verification", resendVerificationEmail);
