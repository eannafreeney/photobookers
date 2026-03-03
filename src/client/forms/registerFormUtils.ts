type RegisterFormContext = {
  form: {
    email: string;
    website: string;
    displayName: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    form: {
      email: string;
      website: string;
      displayName: string;
      password: string;
      confirmPassword: string;
    };
  };
  validateConfirmPassword(): void;
};

export function createRegisterFormUtils() {
  return {
    validateEmail() {
      const ctx = this as unknown as RegisterFormContext;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!ctx.form.email) {
        ctx.errors.form.email = "Email is required";
      } else if (!emailRegex.test(ctx.form.email)) {
        ctx.errors.form.email = "Please enter a valid email";
      } else {
        ctx.errors.form.email = "";
      }
    },

    validateWebsite() {
      const ctx = this as unknown as RegisterFormContext;
      const websiteRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      if (!ctx.form.website) {
        ctx.errors.form.website = "Website is required";
      } else if (!websiteRegex.test(ctx.form.website)) {
        ctx.errors.form.website =
          "Please enter a valid URL (e.g., https://example.com)";
      } else {
        ctx.errors.form.website = "";
      }
    },

    validateDisplayName() {
      const ctx = this as unknown as RegisterFormContext;
      if (!ctx.form.displayName) {
        ctx.errors.form.displayName = "Display Name is required";
      } else {
        ctx.errors.form.displayName = "";
      }
    },

    validatePassword() {
      const ctx = this as unknown as RegisterFormContext;
      if (!ctx.form.password) {
        ctx.errors.form.password = "Password is required";
      } else if (ctx.form.password.length < 8) {
        ctx.errors.form.password = "Password must be at least 8 characters";
      } else {
        ctx.errors.form.password = "";
      }
      if (ctx.form.confirmPassword) {
        ctx.validateConfirmPassword();
      }
    },

    validateConfirmPassword() {
      const ctx = this as unknown as RegisterFormContext;
      if (ctx.form.confirmPassword !== ctx.form.password) {
        ctx.errors.form.confirmPassword = "Passwords do not match";
      } else {
        ctx.errors.form.confirmPassword = "";
      }
    },
  };
}
