type RandomPickButtonProps = {
  action: string;
  text: string;
};

const RandomPickButton = ({ action, text }: RandomPickButtonProps) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success": "$dispatch('planner:updated')",
  };

  return (
    <form method="post" action={action} {...alpineAttrs}>
      <button
      type="submit"
      class="flex w-full min-h-16 flex-col items-center justify-center rounded border border-dashed border-outline bg-surface-alt/50 py-4 text-sm font-medium text-on-surface hover:border-outline-strong hover:bg-surface-alt hover:text-on-surface"
    >
      {text}
      </button>
    </form>
  );
};

export default RandomPickButton;
