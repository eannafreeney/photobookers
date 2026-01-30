import Alpine from "alpinejs";
import { registerFormSchema } from "../../schemas";

export function registerRegisterForm() {
  Alpine.data("registerForm", () => {
    return {
      isSubmitting: false,
      isEmailChecking: false,
      fieldStatus: "",
      emailIsTaken: false,
      form: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        type: "",
        agreeToTerms: false,
      },

      errors: {
        form: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          type: "",
          agreeToTerms: false,
        },
      },

      validateField(field: string) {
        const result = registerFormSchema.safeParse(this.form);
        const fieldError =
          result.error?.flatten().fieldErrors[
            field as keyof typeof this.errors.form
          ];
        if (fieldError && fieldError[0]) {
          this.errors.form[field as keyof typeof this.errors.form] =
            fieldError[0];
        } else {
          delete this.errors.form[field as keyof typeof this.errors.form];
        }
      },

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

      validatePassword() {
        if (!this.form.password) {
          this.errors.form.password = "Password is required";
        } else if (this.form.password.length < 8) {
          this.errors.form.password = "Password must be at least 8 characters";
        } else {
          this.errors.form.password = "";
        }

        // Re-validate confirm password when password changes
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

      get isFormValid() {
        return (
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.firstName &&
          this.form.lastName &&
          this.form.type &&
          this.form.email &&
          this.form.password &&
          this.form.confirmPassword &&
          this.form.confirmPassword === this.form.password &&
          this.form.agreeToTerms &&
          !this.isEmailChecking &&
          !this.emailIsTaken
        );
      },

      submitForm(event: Event) {
        this.isSubmitting = true;
        const result = registerFormSchema.safeParse(this.form);

        if (!result.success) {
          event.preventDefault();
          this.isSubmitting = false;

          this.errors.form = result.error.flatten().fieldErrors;
          return;
        }

        this.isSubmitting = false;
      },

      async checkEmailAvailability() {
        if (!this.form.email) return;

        this.isEmailChecking = true;
        try {
          const response = await fetch(
            `/api/check-email?email=${encodeURIComponent(this.form.email)}`
          );
          const html = await response.text();

          this.fieldStatus = html;
          this.emailIsTaken = html.includes("text-error");
        } catch (error) {
          console.error("Failed to check email availability", error);
        } finally {
          this.isEmailChecking = false;
        }
      },
    };
  });
}
