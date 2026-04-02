import { loadingIcon } from "../../lib/icons";
import Button from "./Button";

type Props = {
  action: string;
  buttonText: string;
  variant: "solid" | "outline" | "ghost";
  color:
    | "primary"
    | "secondary"
    | "alternate"
    | "inverse"
    | "info"
    | "warning"
    | "danger"
    | "success";
  loadingText?: string;
};

const FormButton = ({
  action,
  buttonText,
  variant,
  color,
  loadingText = "Submitting...",
}: Props) => {
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:close'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": "toast",
  };

  return (
    <form method="post" action={action} {...alpineAttrs}>
      <Button variant={variant} color={color} type="submit">
        <div class="flex items-center justify-center gap-2">
          <span x-show="!isSubmitting">{buttonText}</span>
          <span
            x-show="isSubmitting"
            class="flex items-center justify-center gap-2"
          >
            {loadingText} {loadingIcon}
          </span>
        </div>
      </Button>
    </form>
  );
};

export default FormButton;
