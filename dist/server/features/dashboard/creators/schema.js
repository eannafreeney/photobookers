import z from "zod";
import { optionalText } from "../../../schemas/index.js";
const creatorFormSchema = z.object({
  displayName: z.string().min(3, "Display Name must be at least 3 characters"),
  tagline: z.string().max(150, "Tagline must be less than 150 characters"),
  bio: z.string().max(1e3, "Description must be less than 1000 characters").optional(),
  city: optionalText,
  country: optionalText,
  type: z.preprocess(
    (val) => val === "" ? void 0 : val,
    z.enum(["artist", "publisher"])
  ),
  facebook: optionalText,
  twitter: optionalText,
  instagram: optionalText,
  website: optionalText
});
export {
  creatorFormSchema
};
