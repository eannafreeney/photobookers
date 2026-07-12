import { describe, expect, it } from "vitest";
import {
  forgotPasswordFormSchema,
  loginFormSchema,
  parseRegisterType,
  registerCreatorFormSchema,
  registerFanFormSchema,
  resetPasswordFormSchema,
} from "./schema";

const validFan = {
  firstName: "Jane",
  lastName: "Reader",
  type: "fan" as const,
  email: "jane@example.com",
  password: "password123",
  confirmPassword: "password123",
  agreeToTerms: "on",
  captchaToken: "token",
};

describe("parseRegisterType", () => {
  it("returns known types and defaults to fan", () => {
    expect(parseRegisterType("artist")).toBe("artist");
    expect(parseRegisterType("publisher")).toBe("publisher");
    expect(parseRegisterType("fan")).toBe("fan");
    expect(parseRegisterType("unknown")).toBe("fan");
  });
});

describe("loginFormSchema", () => {
  it("accepts valid credentials", () => {
    const parsed = loginFormSchema.parse({
      email: "user@example.com",
      password: "password123",
    });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects short passwords", () => {
    expect(() =>
      loginFormSchema.parse({
        email: "user@example.com",
        password: "short",
      }),
    ).toThrow();
  });
});

describe("registerFanFormSchema", () => {
  it("accepts a valid fan registration", () => {
    const parsed = registerFanFormSchema.parse(validFan);
    expect(parsed.agreeToTerms).toBe(true);
    expect(parsed.type).toBe("fan");
  });

  it("rejects short names and missing captcha", () => {
    expect(() =>
      registerFanFormSchema.parse({ ...validFan, firstName: "Jo" }),
    ).toThrow();
    expect(() =>
      registerFanFormSchema.parse({ ...validFan, captchaToken: "" }),
    ).toThrow();
  });
});

describe("registerCreatorFormSchema", () => {
  it("accepts website without protocol", () => {
    const parsed = registerCreatorFormSchema.parse({
      displayName: "Jane Artist",
      website: "example.com",
      type: "artist",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
      agreeToTerms: true,
      captchaToken: "token",
    });
    expect(parsed.website).toBe("https://example.com");
  });

  it("treats blank website as undefined", () => {
    const parsed = registerCreatorFormSchema.parse({
      displayName: "Jane Artist",
      website: "   ",
      type: "artist",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
      agreeToTerms: true,
      captchaToken: "token",
    });
    expect(parsed.website).toBeUndefined();
  });
});

describe("forgotPasswordFormSchema", () => {
  it("requires a valid email", () => {
    expect(() => forgotPasswordFormSchema.parse({ email: "bad" })).toThrow();
  });
});

describe("resetPasswordFormSchema", () => {
  it("normalizes isModal and accepts matching passwords", () => {
    const parsed = resetPasswordFormSchema.parse({
      isModal: "true",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(parsed.isModal).toBe(true);
  });
});
