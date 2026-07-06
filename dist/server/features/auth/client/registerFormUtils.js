function createRegisterFormUtils() {
  return {
    validateEmail() {
      const ctx = this;
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
      const ctx = this;
      const websiteRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      let value = (ctx.form.website || "").trim();
      if (value && !/^https?:\/\//i.test(value)) {
        value = "https://" + value;
      }
      if (!value) {
        ctx.errors.form.website = "";
      } else if (!websiteRegex.test(value)) {
        ctx.errors.form.website = "Please enter a valid URL (e.g., https://example.com)";
      } else {
        ctx.errors.form.website = "";
        ctx.form.website = value;
      }
    },
    validateDisplayName() {
      const ctx = this;
      if (!ctx.form.displayName) {
        ctx.errors.form.displayName = "Display Name is required";
      } else {
        ctx.errors.form.displayName = "";
      }
    },
    validatePassword() {
      const ctx = this;
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
      const ctx = this;
      if (ctx.form.confirmPassword !== ctx.form.password) {
        ctx.errors.form.confirmPassword = "Passwords do not match";
      } else {
        ctx.errors.form.confirmPassword = "";
      }
    }
  };
}
export {
  createRegisterFormUtils
};
