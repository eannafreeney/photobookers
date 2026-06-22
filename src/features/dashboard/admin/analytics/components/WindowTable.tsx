import { PropsWithChildren } from "hono/jsx";

const WindowTable = ({ children }: PropsWithChildren) => {
  return (
    <div class="max-h-96 overflow-y-auto overscroll-contain border border-on-surface border-radius p-2">
      {children}
    </div>
  );
};

export default WindowTable;
