import { Hono } from "hono";
import {
  getAccountsPage,
  getLoginPage,
  getRegisterPage,
  getResendVerficationEmailPage,
  login,
  logout,
  processRegister,
  registerCreator,
  registerFan,
  resendVerificationEmail,
} from "./controllers";
import {
  loginFormSchema,
  redirectUrlSchema,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resendVerificationFormSchema,
} from "../../schemas";
import { formValidator, paramValidator } from "../../lib/validator";

const authRoutes = new Hono();

authRoutes.get("/accounts", getAccountsPage);
authRoutes.get("/login", getLoginPage);
authRoutes.get("/register", getRegisterPage);
authRoutes.get("/resend-verification", getResendVerficationEmailPage);
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
authRoutes.get("/callback", processRegister);
authRoutes.get("/logout", logout);
