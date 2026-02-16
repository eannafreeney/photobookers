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
        "grid grid-cols-1 sm:grid-cols-2 gap-4 items-start",
        isFullWidth ? "lg:grid-cols-4 " : "lg:grid-cols-3",
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GridPanel;
