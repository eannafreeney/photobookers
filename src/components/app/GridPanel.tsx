import clsx from "clsx";
import { ChildType } from "../../../types";

type GridPanelProps = {
  children: ChildType | ChildType[];
  isFullWidth?: boolean;
  id?: string;
  xMerge?: "append";
};

const GridPanel = ({
  children,
  isFullWidth = false,
  id,
  xMerge,
  ...props
}: GridPanelProps) => {
  return (
    <div
      id={id}
      x-merge={xMerge ?? "replace"}
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        isFullWidth ? "lg:grid-cols-4 " : "lg:grid-cols-3",
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GridPanel;
