import clsx from "clsx";
import { ChildType } from "../../../types";

type GridPanelProps = {
  children: ChildType | ChildType[];
  isFullWidth?: boolean;
};

const GridPanel = ({ children, isFullWidth = false }: GridPanelProps) => {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        isFullWidth ? "lg:grid-cols-4 " : "lg:grid-cols-3"
      )}
    >
      {children}
    </div>
  );
};
export default GridPanel;
