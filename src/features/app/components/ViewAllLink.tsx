const ViewAllLink = ({ href, text }: { href: string; text?: string }) => {
  return (
    <a
      href={href}
      class="text-xs group text-base-content/60 hover:text-base-content duration-300 tracking-wide border-b-2 border-transparent hover:border-b-2 hover:border-base-content/60"
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
