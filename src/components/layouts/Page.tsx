import { PropsWithChildren } from "hono/jsx";

type PageProps = PropsWithChildren<{}>;

const Page = ({ children }: PageProps) => {
  return (
    <div class="px-4 min-h-screen flex flex-col mt-4 mb-12 space-y-4">
      {children}
    </div>
  );
};

export default Page;
