import z from "zod";
const coverImageFormSchema = z.object({
  cover: z.object({
    size: z.number().max(5 * 1024 * 1024),
    type: z.string(),
    name: z.string()
  })
});
export {
  coverImageFormSchema
};
