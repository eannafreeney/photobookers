import { Hono } from "hono";
import {
  getAccountsPage,
  getSetNewPasswordPage,
  getLoginPage,
  getRegisterPage,
  getResendVerificationEmailPage,
  getResetPasswordModal,
  login,
  logout,
  processRegister,
  registerCreator,
  registerFan,
  resendVerificationEmail,
  resetPassword,
  setSession,
  validateDisplayName,
  validateEmail,
  validateWebsite,
} from "./controllers";
import { redirectUrlSchema } from "../../schemas";
import { formValidator, paramValidator } from "../../lib/validator";
import {
  loginFormSchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resendVerificationFormSchema,
  resetPasswordFormSchema,
  validateDisplayNameSchema,
  validateEmailSchema,
  validateWebsiteSchema,
} from "./schema";

export const authRoutes = new Hono();
// ---------- Pages (GET) ----------
authRoutes.get("/accounts", getAccountsPage);
authRoutes.get("/login", getLoginPage);
authRoutes.get("/register", getRegisterPage);
authRoutes.get("/resend-verification", getResendVerificationEmailPage);
authRoutes.get("/force-reset-password", getSetNewPasswordPage);
authRoutes.get("/reset-password", getResetPasswordModal);

// ---------- Auth flow (GET/POST) ----------
authRoutes.get("/callback", processRegister);
authRoutes.post("/logout", logout);
authRoutes.post(
  "/resend-verification",
  formValidator(resendVerificationFormSchema),
  resendVerificationEmail,
);
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
authRoutes.post(
  "/reset-password",
  formValidator(resetPasswordFormSchema),
  resetPassword,
);
authRoutes.post("/set-session", setSession);

// ---------- Validation (POST) ----------
authRoutes.post(
  "/validate/email",
  formValidator(validateEmailSchema),
  validateEmail,
);
authRoutes.post(
  "/validate/display-name",
  formValidator(validateDisplayNameSchema),
  validateDisplayName,
);
authRoutes.post(
  "/validate/website",
  formValidator(validateWebsiteSchema),
  validateWebsite,
);
