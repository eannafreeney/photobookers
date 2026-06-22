import Alpine from "alpinejs";
import {
  createFormState,
  handleSubmit,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";
import { fairFormAdminSchema } from "../schema";

const FAIR_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "city",
  "country",
  "venue",
  "website",
  "start_date",
  "end_date",
  "status",
  "listing_tier",
  "sort_order",
];

export function registerFairFormAdmin() {
  Alpine.data("fairFormAdmin", (formValues: any, isEditMode: boolean) => ({
    ...createFormState(FAIR_FORM_FIELDS, formValues),
    isEditMode,
    validateField(field: string) {
      return validateField(this, field, fairFormAdminSchema);
    },
    submitForm(event: Event) {
      return handleSubmit(this, event, fairFormAdminSchema);
    },
    onSuccess() {
      if (!this.isEditMode) {
        resetFormBaseline(this, FAIR_FORM_FIELDS);
      }
    },
  }));
}
