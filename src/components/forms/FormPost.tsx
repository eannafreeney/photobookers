import { PropsWithChildren } from "hono/jsx";

const FormPost = ({
  id,
  action,
  children,
  ...alpineAttrs
}: PropsWithChildren<{ action: string } & Record<string, any>>) => {
  return (
    <form id={id} method="post" action={action} {...alpineAttrs}>
      {children}
    </form>
  );
};

export default FormPost;
