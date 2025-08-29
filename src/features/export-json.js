import { matchesSearch } from "../render/content.js";

export function exportFiltered(categories, state) {
  const filtered = categories
    .filter((c) => state.levels.has(c.level))
    .filter((c) => matchesSearch(state, c));

  const blob = new Blob([JSON.stringify({ categories: filtered }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tailwind-docs-filtered.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
