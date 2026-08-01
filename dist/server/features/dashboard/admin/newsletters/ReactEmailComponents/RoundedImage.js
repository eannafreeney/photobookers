import { jsx } from "react/jsx-runtime";
import { Img } from "@react-email/components";
const RoundedImage = ({
  src,
  alt,
  className
}) => /* @__PURE__ */ jsx(
  Img,
  {
    src,
    alt,
    className: `block w-50 h-50 object-cover mx-auto rounded-full mb-6 ${className}`
  }
);
export {
  RoundedImage
};
