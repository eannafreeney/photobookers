import Button from "../app/Button";

type Props = {
  entity: string;
  buttonWidth?: "full" | "auto" | "fit" | "sm" | "md" | "lg" | "xl";
};

const CopyCellCol = ({ entity, buttonWidth = "fit" }: Props) => {
  return (
    <div
      x-data={`{ cellValue: '${entity}', copied: false }`}
      class="flex items-center gap-2"
    >
      <Button
        variant="outline"
        width={buttonWidth}
        color="inverse"
        x-on:click="copied = !copied; navigator.clipboard.writeText(cellValue)"
        x-text="copied ? 'Copied!' : 'Copy'"
      >
        Copy
      </Button>
    </div>
  );
};
export default CopyCellCol;
