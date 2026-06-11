const ViewAllLink = ({ href, text }: { href: string; text?: string }) => {
  return (
    <a
      href={href}
      class="kicker group text-on-surface-weak hover:text-accent duration-300 border-b-2 border-transparent hover:border-accent"
    >
      <span class="inline-flex items-center ">
        {`View All ${text ?? ""}`}
        <span class="w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap ">
          &nbsp;→
        </span>
      </span>
    </a>
  );
};

export default ViewAllLink;
