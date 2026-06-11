import clsx from "clsx";
import { ChildType } from "../../../types";

type GridPanelProps = {
  children: ChildType | ChildType[];
  id?: string;
  xMerge?: "replace" | "append";
  isFullWidth?: boolean;
};

const GridPanel = ({
  children,
  id,
  xMerge = "replace",
  isFullWidth = true,
  ...props
}: GridPanelProps) => {
  return (
    <div
      id={id}
      x-merge={xMerge}
      className={clsx(
        "grid gap-x-4 gap-y-10 grid-cols-2 sm:grid-cols-3",
        isFullWidth
          ? "lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          : "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GridPanel;
