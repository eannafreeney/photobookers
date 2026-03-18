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
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" // className=" grid gap-4 grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]"
      {...props}
    >
      {children}
    </div>
  );
};
export default GridPanel;
