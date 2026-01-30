type HeadProps = {
  title: string;
};

const Head = ({ title }: HeadProps) => (
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="view-transition" content="same-origin"></meta>
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/src/styles/styles.css" />
    <script type="module" src="/src/client/main.js"></script>
  </head>
);

export default Head;
