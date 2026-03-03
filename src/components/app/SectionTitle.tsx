import { ChildType } from "../../../types";

type SectionTitleProps = {
  children: string | ChildType;
};

const SectionTitle = ({ children }: SectionTitleProps) => (
  <h2 class="flex items-center gap-2 text-lg font-bold mb-0">{children}</h2>
);
export default SectionTitle;
