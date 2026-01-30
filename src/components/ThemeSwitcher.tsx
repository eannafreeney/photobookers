function ThemeSwitcher() {
  const themes = ["nord", "abyss", "cupcake", "dracula"];

  return (
    <select
      onChange={(e) =>
        document.documentElement.setAttribute("data-theme", e.target.value)
      }
      className="select select-bordered"
    >
      {themes.map((theme) => (
        <option key={theme} value={theme}>
          {theme}
        </option>
      ))}
    </select>
  );
}

export default ThemeSwitcher;
