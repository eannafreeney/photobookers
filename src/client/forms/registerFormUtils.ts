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

    validateWebsite() {
      const websiteRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      if (!this.form.website) {
        this.errors.form.website = "Website is required";
      } else if (!websiteRegex.test(this.form.website)) {
        this.errors.form.website =
          "Please enter a valid URL (e.g., https://example.com)";
      } else {
        this.errors.form.website = "";
        this.checkWebsiteAvailability();
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

      this._emailAbortController?.abort();
      this._emailAbortController = new AbortController();
      const signal = this._emailAbortController.signal;

      this.isEmailChecking = true;
      try {
        const response = await fetch(
          `/api/check-email?email=${encodeURIComponent(this.form.email)}`,
          { signal },
        );
        const html = await response.text();

        this.emailAvailabilityStatus = html;
        this.emailIsTaken = html.includes("text-danger");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to check email availability", error);
      } finally {
        this.isEmailChecking = false;
      }
    },

    async checkDisplayNameAvailability() {
      if (!this.form.displayName) return;

      this._displayNameAbortController?.abort();
      this._displayNameAbortController = new AbortController();
      const signal = this._displayNameAbortController.signal;

      this.isDisplayNameChecking = true;
      try {
        const response = await fetch(
          `/api/check-displayName?displayName=${encodeURIComponent(this.form.displayName)}`,
          { signal },
        );
        const html = await response.text();

        this.displayNameAvailabilityStatus = html;
        console.log(html);

        this.displayNameIsTaken = html.includes("text-danger");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to check display name availability", error);
      } finally {
        this.isDisplayNameChecking = false;
      }
    },

    async checkWebsiteAvailability() {
      if (!this.form.website) return;

      this._websiteAbortController?.abort();
      this._websiteAbortController = new AbortController();
      const signal = this._websiteAbortController.signal;

      this.isWebsiteChecking = true;
      try {
        const response = await fetch(
          `/api/check-website?website=${encodeURIComponent(this.form.website)}`,
          { signal },
        );
        const html = await response.text();

        this.websiteAvailabilityStatus = html;

        this.websiteIsTaken = html.includes("text-danger");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to check website availability", error);
      } finally {
        this.isWebsiteChecking = false;
      }
    },
  };
}
