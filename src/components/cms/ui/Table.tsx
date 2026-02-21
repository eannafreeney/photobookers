import { PropsWithChildren } from "hono/jsx";
import { ChildType } from "../../../../types";

type Props = PropsWithChildren<{
  id?: string;
}>;

const Table = ({ children, id, ...props }: Props) => {
  return (
    <div class="overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
      <table
        id={id}
        class="w-full text-left text-sm text-on-surface"
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHead = ({ children }: { children: ChildType }) => (
  <thead class="border-b border-outline bg-surface-alt text-sm text-on-surface-strong">
    {children}
  </thead>
);

const TableBody = ({
  children,
  props,
  id,
}: PropsWithChildren<{
  id?: string;
  props?: PropsWithChildren;
}>) => (
  <tbody id={id} class="divide-y divide-outline" {...props} x-merge="append">
    {children}
  </tbody>
);

Table.Head = TableHead;
Table.Body = TableBody;

export default Table;
