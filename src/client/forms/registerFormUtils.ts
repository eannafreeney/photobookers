import { registerCreatorFormSchema } from "../../schemas";
import { validateField } from "./formUtils";

export function createRegisterFormUtils() {
  return {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email) {
        this.errors.form.email = "Email is required";
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.form.email = "Please enter a valid email";
      } else {
        this.errors.form.email = "";
        this.checkEmailAvailability();
      }
    },

    validateDisplayName() {
      validateField(this, "displayName", registerCreatorFormSchema);
      if (this.form.displayName && this.form.displayName.length > 2) {
        this.checkDisplayNameAvailability();
      }
    },

    validatePassword() {
      if (!this.form.password) {
        this.errors.form.password = "Password is required";
      } else if (this.form.password.length < 8) {
        this.errors.form.password = "Password must be at least 8 characters";
      } else {
        this.errors.form.password = "";
      }

      if (this.form.confirmPassword) {
        this.validateConfirmPassword();
      }
    },

    validateConfirmPassword() {
      if (this.form.confirmPassword !== this.form.password) {
        this.errors.form.confirmPassword = "Passwords do not match";
      } else {
        this.errors.form.confirmPassword = "";
      }
    },

    async checkEmailAvailability() {
      if (!this.form.email) return;

      this.isEmailChecking = true;
      try {
        const response = await fetch(
          `/api/check-email?email=${encodeURIComponent(this.form.email)}`,
        );
        const html = await response.text();

        this.emailAvailabilityStatus = html;
        this.emailIsTaken = html.includes("text-danger");
      } catch (error) {
        console.error("Failed to check email availability", error);
      } finally {
        this.isEmailChecking = false;
      }
    },

    async checkDisplayNameAvailability() {
      if (!this.form.displayName) return;

      this.isDisplayNameChecking = true;
      try {
        const response = await fetch(
          `/api/check-displayName?displayName=${encodeURIComponent(this.form.displayName)}`,
        );
        const html = await response.text();

        this.displayNameAvailabilityStatus = html;
        console.log(html);

        this.displayNameIsTaken = html.includes("text-danger");
      } catch (error) {
        console.error("Failed to check display name availability", error);
      } finally {
        this.isDisplayNameChecking = false;
      }
    },
  };
}
