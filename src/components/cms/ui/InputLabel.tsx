type InputLabelProps = {
  label: string;
  maxLength?: number;
  name?: string;
  required?: boolean;
};

const InputLabel = ({ label, maxLength, name, required }: InputLabelProps) => {
  return (
    <div class="flex items-center justify-between text-xs">
      <legend class="w-fit pl-0.5">
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
    </div>
  );
};

export default InputLabel;
