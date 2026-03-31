import { PropsWithChildren } from "hono/jsx";

const ToastContainer = ({ children }: PropsWithChildren) => {
  return (
    <ul
      x-sync
      id="toast"
      x-merge="prepend"
      role="status"
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 "
    >
      {children}
    </ul>
  );
};

export default ToastContainer;
