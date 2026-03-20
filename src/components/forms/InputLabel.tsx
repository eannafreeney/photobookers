import { fadeTransition } from "../../lib/transitions";

type InputLabelProps = {
  label: string;
  maxLength?: number;
  name?: string;
  required?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
};

const InputLabel = ({
  label,
  maxLength,
  name,
  required,
  isError,
  isSuccess,
}: InputLabelProps) => {
  return (
    <div class="flex items-center justify-between text-xs">
      <legend class="w-fit pl-0.5">
        {label} {required && <span class="text-danger"> *</span>}
      </legend>
      <div class="flex items-center gap-2">
        {maxLength && (
          <div
            class="text-xs"
            x-bind:class={`
          ${maxLength} - ${name}.length <= 10 
          ? 'text-danger font-medium' 
          : ${maxLength} - ${name}.length <= 30 
          ? 'text-warning' 
          : 'text-on-surface/60'
          `}
          >
            <span x-text={`${name}.length`}></span> / {maxLength}
          </div>
        )}
        <InputError isError={isError} isSuccess={isSuccess} name={name} />
      </div>
    </div>
  );
};

export default InputLabel;

type InputErrorProps = {
  isError?: boolean;
  isSuccess?: boolean;
  name?: string;
};

const InputError = ({ isError, isSuccess, name }: InputErrorProps) => (
  <div class="text-xs min-h-4 my-2 block">
    {isError ? (
      <span class="text-danger block text-right" {...fadeTransition}>
        ✗ Taken
      </span>
    ) : isSuccess ? (
      <span class="text-success block text-right" {...fadeTransition}>
        ✓ Available
      </span>
    ) : (
      <span
        class="text-danger block text-left"
        x-show={`errors.${name}`}
        x-text={`errors.${name}`}
        {...fadeTransition}
      />
    )}
  </div>
);
