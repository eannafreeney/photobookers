import Button from "@/components/app/Button";
import Link from "@/components/app/Link";

type Props = {
  href: string;
};
const EditRowButton = ({ href }: Props) => {
  return (
    <Link href={href}>
      <Button variant="outline" color="primary" width="fit">
        Edit
      </Button>
    </Link>
  );
};

export default EditRowButton;
