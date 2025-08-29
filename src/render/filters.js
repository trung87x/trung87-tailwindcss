import { LEVEL_META } from "../config.js";

export function renderLevelFilters(container, state, onChange) {
  container.innerHTML = "";
  for (const key of Object.keys(LEVEL_META)) {
    const active = state.levels.has(key);
    const meta = LEVEL_META[key];
    const btn = document.createElement("button");
    btn.className = `text-xs md:text-sm rounded-full px-3 py-1.5 border transition ${
      active
        ? "border-transparent text-white " + meta.color
        : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;
    btn.textContent = meta.label;
    btn.dataset.level = key;
    btn.addEventListener("click", () => {
      if (state.levels.has(key)) state.levels.delete(key);
      else state.levels.add(key);
      onChange();
    });
    container.appendChild(btn);
  }
}
