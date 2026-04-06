import { PropsWithChildren } from "hono/jsx";

const FormPatch = ({
  id,
  action,
  children,
  ...alpineAttrs
}: PropsWithChildren<{ action: string } & Record<string, any>>) => {
  return (
    <form id={id} method="post" action={action} {...alpineAttrs}>
      <input type="hidden" name="_method" value="PATCH" />
      {children}
    </form>
  );
};

export default FormPatch;
