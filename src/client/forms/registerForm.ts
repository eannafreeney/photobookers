// import Alpine from "alpinejs";
// import { registerFormSchema } from "../../schemas";

// export function registerRegisterForm() {
//   Alpine.data("registerForm", () => {
//     return {
//       isSubmitting: false,
//       isEmailChecking: false,
//       emailAvailabilityStatus: "",
//       emailIsTaken: false,
//       form: {
//         firstName: "",
//         lastName: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         type: "",
//         agreeToTerms: false,
//       },

//       errors: {
//         form: {
//           firstName: "",
//           lastName: "",
//           email: "",
//           password: "",
//           confirmPassword: "",
//           type: "",
//           agreeToTerms: false,
//         },
//       },

//       validateField(field: string) {
//         // For firstName/lastName, only validate if type is "fan"
//         if (
//           (field === "firstName" || field === "lastName") &&
//           this.form.type !== "fan"
//         ) {
//           // Clear errors for these fields when type is not "fan"
//           this.errors.form[field as keyof typeof this.errors.form] = "";
//           return;
//         }

//         const result = registerFormSchema.safeParse(this.form);
//         const fieldError =
//           result.error?.flatten().fieldErrors[
//             field as keyof typeof this.errors.form
//           ];
//         if (fieldError && fieldError[0]) {
//           this.errors.form[field as keyof typeof this.errors.form] =
//             fieldError[0];
//         } else {
//           delete this.errors.form[field as keyof typeof this.errors.form];
//         }
//       },

//       validateEmail() {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!this.form.email) {
//           this.errors.form.email = "Email is required";
//         } else if (!emailRegex.test(this.form.email)) {
//           this.errors.form.email = "Please enter a valid email";
//         } else {
//           this.errors.form.email = "";
//           this.checkEmailAvailability();
//         }
//       },

//       validatePassword() {
//         if (!this.form.password) {
//           this.errors.form.password = "Password is required";
//         } else if (this.form.password.length < 8) {
//           this.errors.form.password = "Password must be at least 8 characters";
//         } else {
//           this.errors.form.password = "";
//         }

//         // Re-validate confirm password when password changes
//         if (this.form.confirmPassword) {
//           this.validateConfirmPassword();
//         }
//       },

//       validateConfirmPassword() {
//         if (this.form.confirmPassword !== this.form.password) {
//           this.errors.form.confirmPassword = "Passwords do not match";
//         } else {
//           this.errors.form.confirmPassword = "";
//         }
//       },

//       get isFormValid() {
//         const isFan = this.form.type === "fan";

//         // Base validation - check all errors are cleared
//         const hasNoErrors = Object.values(this.errors.form).every((err) => {
//           // For non-fan types, ignore firstName/lastName errors
//           if (
//             !isFan &&
//             (err === this.errors.form.firstName ||
//               err === this.errors.form.lastName)
//           ) {
//             return true;
//           }
//           return !err;
//         });

//         // Required fields based on type
//         const hasRequiredFields =
//           this.form.type &&
//           this.form.email &&
//           this.form.password &&
//           this.form.confirmPassword &&
//           this.form.confirmPassword === this.form.password &&
//           this.form.agreeToTerms &&
//           // Only require firstName/lastName for fan type
//           (isFan ? this.form.firstName && this.form.lastName : true);

//         return (
//           hasNoErrors &&
//           hasRequiredFields &&
//           !this.isEmailChecking &&
//           !this.emailIsTaken
//         );
//       },

//       submitForm(event: Event) {
//         this.isSubmitting = true;
//         // Create a modified form object for validation
//         // If type is not "fan", make firstName/lastName optional
//         const formToValidate = { ...this.form };
//         if (formToValidate.type !== "fan") {
//           // Set to empty string or undefined to make them optional
//           formToValidate.firstName = formToValidate.firstName || "";
//           formToValidate.lastName = formToValidate.lastName || "";
//         }

//         const result = registerFormSchema.safeParse(this.form);

//         if (!result.success) {
//           event.preventDefault();
//           this.isSubmitting = false;

//           // Filter out firstName/lastName errors for non-fan types
//           const flattenedErrors = result.error.flatten().fieldErrors;
//           if (this.form.type !== "fan") {
//             delete flattenedErrors.firstName;
//             delete flattenedErrors.lastName;
//           }

//           this.errors.form = flattenedErrors;
//           return;
//         }
//       },

//       async checkEmailAvailability() {
//         if (!this.form.email) return;

//         this.isEmailChecking = true;
//         try {
//           const response = await fetch(
//             `/api/check-email?email=${encodeURIComponent(this.form.email)}`,
//           );
//           const html = await response.text();

//           this.emailAvailabilityStatus = html;
//           this.emailIsTaken = html.includes("text-error");
//         } catch (error) {
//           console.error("Failed to check email availability", error);
//         } finally {
//           this.isEmailChecking = false;
//         }
//       },
//     };
//   });
// }
