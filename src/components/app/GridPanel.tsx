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
  console.log("isFullWidth", isFullWidth);

  return (
    <div
      id={id}
      x-merge={xMerge}
      className={clsx(
        "grid gap-4 grid-cols-1 sm:grid-cols-3",
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
