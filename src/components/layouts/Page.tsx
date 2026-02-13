import { PropsWithChildren } from "hono/jsx";

type PageProps = PropsWithChildren<{}>;

const Page = ({ children }: PageProps) => {
  return (
    <div class="px-4 min-h-screen flex flex-col gap-4 mt-6 mb-12 space-y-4">
      {children}
    </div>
  );
};

export default Page;
