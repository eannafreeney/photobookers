import { PropsWithChildren } from "hono/jsx";

const FormPost = ({
  id,
  action,
  children,
  className,
  ...alpineAttrs
}: PropsWithChildren<{ action: string } & Record<string, any>>) => {
  return (
    <form
      id={id}
      method="post"
      action={action}
      class={className}
      {...alpineAttrs}
    >
      {children}
    </form>
  );
};

export default FormPost;
