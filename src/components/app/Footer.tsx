const Footer = () => (
  <footer class="flex items-center justify-between bg-surface text-on-surface text-sm p-4">
    <nav class="flex gap-4 justify-between items-center">
      <a href="/artists">Artists</a>
      <a href="/publishers">Publishers</a>
      <a href="/about">About</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
    </nav>
    <aside>
      <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
    </aside>
  </footer>
);

export default Footer;
