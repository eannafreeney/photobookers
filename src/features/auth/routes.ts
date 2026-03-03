import { Hono } from "hono";
import {
  getAccountsPage,
  getForceResetPasswordPage,
  getLoginPage,
  getRegisterPage,
  getResendVerficationEmailPage,
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

authRoutes.get("/accounts", getAccountsPage);
authRoutes.get("/login", getLoginPage);
authRoutes.get("/register", getRegisterPage);
authRoutes.get("/resend-verification", getResendVerficationEmailPage);
authRoutes.get("/callback", processRegister);
authRoutes.get("/logout", logout);
authRoutes.get("/force-reset-password", getForceResetPasswordPage);
authRoutes.get("/reset-password", getResetPasswordModal);
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
authRoutes.post(
  "/validate-email",
  formValidator(validateEmailSchema),
  validateEmail,
);
authRoutes.post(
  "/validate-displayName",
  formValidator(validateDisplayNameSchema),
  validateDisplayName,
);
authRoutes.post(
  "/validate-website",
  formValidator(validateWebsiteSchema),
  validateWebsite,
);
