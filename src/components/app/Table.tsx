import { PropsWithChildren } from "hono/jsx";
import { ChildType } from "../../../types";

type Props = PropsWithChildren<{
  id?: string;
}>;

const Table = ({ children, id }: Props) => {
  return (
    <div class="overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
      <table id={id} class="w-full text-left text-sm text-on-surface">
        {children}
      </table>
    </div>
  );
};

type TableHeadProps = {
  children: ChildType;
};

const TableHead = ({ children }: TableHeadProps) => (
  <thead class="border-b border-outline bg-surface-alt text-sm text-on-surface-strong">
    {children}
  </thead>
);

type TableHeadRowProps = {
  children: ChildType;
};

export const TableHeadRow = ({ children }: TableHeadRowProps) => (
  <th class="p-4">{children}</th>
);

type TableBodyProps = {
  children: ChildType;
  id?: string;
  xMerge?: "replace" | "append";
  props?: PropsWithChildren;
};

const TableBody = ({
  children,
  id,
  xMerge = "replace",
  ...props
}: TableBodyProps) => (
  <tbody id={id} class="divide-y divide-outline" x-merge={xMerge} {...props}>
    {children}
  </tbody>
);

type TableBodyRowProps = {
  children: ChildType;
};

export const TableBodyRow = ({ children }: TableBodyRowProps) => (
  <td class="p-4">{children}</td>
);

Table.Head = TableHead;
Table.HeadRow = TableHeadRow;
Table.Body = TableBody;
Table.BodyRow = TableBodyRow;

export default Table;
