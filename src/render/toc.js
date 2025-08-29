import { LEVEL_META } from "../config.js";

export function renderToC(container, containerMobile, categories) {
  const byLevel = categories.reduce((acc, c) => {
    (acc[c.level] ||= []).push(c);
    return acc;
  }, {});

  function makeList(rootEl) {
    rootEl.innerHTML = "";
    for (const level of Object.keys(LEVEL_META)) {
      const list = byLevel[level];
      if (!list) continue;

      const h = document.createElement("div");
      h.className =
        "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";
      h.textContent = LEVEL_META[level].label;
      rootEl.appendChild(h);

      const ul = document.createElement("ul");
      ul.className = "mt-2 space-y-1";
      for (const c of list) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${c.id}`;
        a.className =
          "block px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800";
        a.textContent = c.name;
        li.appendChild(a);
        ul.appendChild(li);
      }
      rootEl.appendChild(ul);
    }
  }

  makeList(container);
  makeList(containerMobile);
}
