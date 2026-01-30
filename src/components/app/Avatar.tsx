type AvatarProps = {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
  firstName?: string;
  lastName?: string;
};

const sizes = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
};

const Avatar = ({
  src,
  alt,
  size = "md",
  firstName,
  lastName,
}: AvatarProps) => {
  if (!src && firstName && lastName) {
    return (
      <span class="flex size-14 items-center justify-center overflow-hidden rounded-full border border-outline bg-surface-alt text-2xl font-bold tracking-wider text-on-surface/80">
        {firstName?.charAt(0)}
        {lastName?.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      class={`${sizes[size]} rounded-full object-cover`}
    />
  );
};

export default Avatar;
