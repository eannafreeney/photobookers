import Button from "./Button";

type Props = {
  entity: string;
  buttonWidth?: "full" | "auto" | "fit" | "sm" | "md" | "lg" | "xl";
};

const CopyCellCol = ({ entity, buttonWidth = "fit" }: Props) => {
  const escapedEntity = entity
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
  return (
    <div
      x-data={`{ cellValue: '${escapedEntity}', copied: false }`}
      class="flex items-center gap-2"
      x-on:click="$dispatch('dialog:close')"
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
