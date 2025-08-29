// Dark mode (nút)
import { mountThemeToggle } from "./features/theme-toggle.js";

// Data
import { loadData, normalize } from "./data/data.js";

// Renderers
import { renderLevelFilters } from "./render/filters.js";
import { renderContent } from "./render/content.js";
import { renderToC } from "./render/toc.js";

// Features
import { bindSearch } from "./features/search.js";
import { exportFiltered } from "./features/export-json.js";
import { bindDrawer } from "./features/drawer.js";

// Utils
import { $ } from "./utils/dom.js";

// --------- App State ---------
const STATE = {
  search: "",
  levels: new Set(["easy", "medium", "hard", "very-hard"]),
};

let CATEGORIES = [];

function renderAll() {
  renderContent($("#content"), CATEGORIES, STATE);
}

// --------- Boot ---------
(async function boot() {
  // Year
  $("#year").textContent = new Date().getFullYear();

  // Data
  const ds = await loadData();
  CATEGORIES = normalize(ds);

  // UI mounts
  renderLevelFilters($("#levelFilters"), STATE, renderAll);
  renderLevelFilters($("#levelFiltersMobile"), STATE, renderAll);
  renderToC($("#toc"), $("#tocMobile"), CATEGORIES);
  renderAll();

  // Search
  bindSearch(STATE, renderAll);

  // Export
  $("#exportBtn").addEventListener("click", () =>
    exportFiltered(CATEGORIES, STATE)
  );

  // Drawer (mobile)
  bindDrawer();

  // Theme toggle (nút)
  mountThemeToggle();
})();
