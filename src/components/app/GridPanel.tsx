import clsx from "clsx";
import { ChildType } from "../../../types";

type GridPanelProps = {
  children: ChildType | ChildType[];
  isFullWidth?: boolean;
  id?: string;
  xMerge?: "replace" | "append";
};

const GridPanel = ({
  children,
  isFullWidth = false,
  id,
  xMerge = "replace",
  ...props
}: GridPanelProps) => {
  return (
    <div
      id={id}
      x-merge={xMerge}
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch",
        isFullWidth ? "lg:grid-cols-5 " : "lg:grid-cols-4",
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GridPanel;
