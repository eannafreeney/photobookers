import { PropsWithChildren } from "hono/jsx";

const FormUpdate = ({
  action,
  children,
  ...alpineAttrs
}: PropsWithChildren<{ action: string } & Record<string, any>>) => {
  return (
    <form method="post" action={action} {...alpineAttrs}>
      <input type="hidden" name="_method" value="PATCH" />
      {children}
    </form>
  );
};

export default FormUpdate;
