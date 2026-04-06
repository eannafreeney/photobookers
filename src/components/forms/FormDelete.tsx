import { PropsWithChildren } from "hono/jsx";

const FormDelete = ({
  action,
  children,
  ...alpineAttrs
}: PropsWithChildren<{ action: string } & Record<string, any>>) => {
  return (
    <form method="post" action={action} {...alpineAttrs}>
      <input type="hidden" name="_method" value="DELETE" />
      {children}
    </form>
  );
};

export default FormDelete;
