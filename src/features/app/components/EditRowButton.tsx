import { button } from "@/components/app/Button";

type Props = {
  href: string;
  xTarget?: string;
};

const EditRowButton = ({ href, xTarget }: Props) => (
  <a
    href={href}
    class={button({ variant: "outline", color: "primary", width: "fit" })}
    {...(xTarget ? { "x-target": xTarget } : {})}
  >
    Edit
  </a>
);

export default EditRowButton;
