import { ChildType } from "../../../types";

type GridPanelProps = {
  children: ChildType | ChildType[];
  id?: string;
  xMerge?: "replace" | "append";
};

const GridPanel = ({
  children,
  id,
  xMerge = "replace",
  ...props
}: GridPanelProps) => {
  return (
    <div
      id={id}
      x-merge={xMerge}
      className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      {...props}
    >
      {children}
    </div>
  );
};
export default GridPanel;
