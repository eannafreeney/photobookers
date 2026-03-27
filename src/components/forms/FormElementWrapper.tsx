import { PropsWithChildren } from "hono/jsx";

type FormElementWrapperProps = PropsWithChildren;

const FormElementWrapper = ({ children }: FormElementWrapperProps) => {
  return (
    <fieldset class="grid gap-0 text-xs grid-cols-1 auto-rows-max">
      {children}
    </fieldset>
  );
};

export default FormElementWrapper;
