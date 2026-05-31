declare module "juice" {
  type JuiceOptions = {
    preserveMediaQueries?: boolean;
    preserveFontFaces?: boolean;
    removeStyleTags?: boolean;
    applyWidthAttributes?: boolean;
    applyHeightAttributes?: boolean;
  };

  function juice(html: string, options?: JuiceOptions): string;

  export default juice;
}
