type InputLabelProps = {
  label: string;
  maxLength?: number;
  name?: string;
  required?: boolean;
  showEmailAvailabilityChecker?: boolean;
  showDisplayNameAvailabilityChecker?: boolean;
};

const InputLabel = ({
  label,
  maxLength,
  name,
  required,
  showEmailAvailabilityChecker = false,
  showDisplayNameAvailabilityChecker = false,
}: InputLabelProps) => {
  return (
    <div class="flex items-center justify-between">
      <legend class="w-fit pl-0.5 text-sm">
        {label} {required && <span class="text-danger -ml-1"> *</span>}
      </legend>
      {maxLength && (
        <p
          class="text-sm"
          x-bind:class={`
                ${maxLength} - ${name}.length <= 10 
                  ? 'text-danger font-medium' 
                  : ${maxLength} - ${name}.length <= 30 
                    ? 'text-warning' 
                    : 'text-on-surface/60'
              `}
        >
          <span x-text={`${name}.length`}></span> / {maxLength}
        </p>
      )}
      {showEmailAvailabilityChecker && (
        <div
          id="email-availability-status"
          x-html="emailAvailabilityStatus"
          class="h-5"
        ></div>
      )}
      {showDisplayNameAvailabilityChecker && (
        <div
          id="display-name-availability-status"
          x-html="displayNameAvailabilityStatus"
          class="h-5"
        ></div>
      )}
    </div>
  );
};

export default InputLabel;
