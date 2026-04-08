import { PropsWithChildren } from "hono/jsx";

const FormDelete = ({
  id,
  action,
  children,
  ...alpineAttrs
}: PropsWithChildren<{ action: string } & Record<string, any>>) => {
  return (
    <form id={id} method="post" action={action} {...alpineAttrs}>
      <input type="hidden" name="_method" value="DELETE" />
      {children}
    </form>
  );
};

export default FormDelete;
