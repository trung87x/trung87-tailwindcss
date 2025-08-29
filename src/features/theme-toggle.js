export function mountThemeToggle() {
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  if (!btn || !icon) return;

  const syncIcon = () => {
    icon.textContent = document.documentElement.classList.contains("dark")
      ? "☀️"
      : "🌙";
  };
  syncIcon();

  btn.addEventListener("click", () => {
    const root = document.documentElement;
    const toDark = !root.classList.contains("dark");
    root.classList.toggle("dark", toDark);
    try {
      localStorage.setItem("theme", toDark ? "dark" : "light");
    } catch (_) {}
    syncIcon();
  });
}
