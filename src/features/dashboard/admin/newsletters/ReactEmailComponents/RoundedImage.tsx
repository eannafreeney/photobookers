/** @jsxImportSource react */

import { Img } from "@react-email/components";

export const RoundedImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <Img
    src={src}
    alt={alt}
    className={`block w-50 h-50 object-cover mx-auto rounded-full mb-6 ${className}`}
  />
);
