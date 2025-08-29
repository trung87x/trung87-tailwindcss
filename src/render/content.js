import { LEVEL_META } from "../config.js";
import { $, $$ } from "../utils/dom.js";

export function matchesSearch(state, cat) {
  if (!state.search) return true;
  const q = state.search.toLowerCase();
  if (cat.name.toLowerCase().includes(q)) return true;
  if ((cat.description || "").toLowerCase().includes(q)) return true;
  for (const it of cat.items) {
    if (it.name.toLowerCase().includes(q)) return true;
    if ((it.desc || "").toLowerCase().includes(q)) return true;
    if (it.class_examples.some((ex) => ex.toLowerCase().includes(q)))
      return true;
  }
  return false;
}

export function renderContent(rootEl, categories, state) {
  rootEl.innerHTML = "";

  const filtered = categories
    .filter((c) => state.levels.has(c.level))
    .filter((c) => matchesSearch(state, c));

  if (!filtered.length) {
    rootEl.innerHTML = `<div class="text-center text-slate-500 mt-16">Không có mục nào khớp bộ lọc/từ khóa.</div>`;
    return;
  }

  const groups = filtered.reduce((acc, c) => {
    (acc[c.level] ||= []).push(c);
    return acc;
  }, {});
  const frag = document.createDocumentFragment();

  for (const level of Object.keys(LEVEL_META)) {
    const list = groups[level];
    if (!list?.length) continue;

    const meta = LEVEL_META[level];
    const h = document.createElement("h2");
    h.className =
      "flex items-center gap-2 text-lg md:text-xl font-semibold mt-6 mb-3";
    h.innerHTML = `<span class="inline-block w-2 h-2 rounded-full ${meta.color}"></span>${meta.label}`;
    frag.appendChild(h);

    for (const cat of list) {
      const section = document.createElement("section");
      section.id = cat.id;
      section.className =
        "mb-4 md:mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur";

      const head = document.createElement("div");
      head.className =
        "px-4 md:px-5 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800 flex items-start md:items-center gap-3";
      head.innerHTML = `
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <a href="#${cat.id}" class="font-semibold hover:underline">${
        cat.name
      }</a>
            <span class="text-[10px] px-2 py-0.5 rounded-full text-white ${
              meta.color
            }">${meta.label}</span>
          </div>
          ${
            cat.description
              ? `<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">${cat.description}</p>`
              : ""
          }
        </div>
        <button class="toggleBtn text-xs rounded-lg border px-2 py-1">Thu gọn</button>
      `;
      section.appendChild(head);

      const listWrap = document.createElement("div");
      listWrap.className = "divide-y divide-slate-200 dark:divide-slate-800";

      for (const item of cat.items) {
        const row = document.createElement("div");
        row.className =
          "px-4 md:px-5 py-3 md:py-4 grid grid-cols-1 md:grid-cols-3 gap-3";

        const left = document.createElement("div");
        left.innerHTML = `
          <div class="font-medium">${item.name}</div>
          ${
            item.desc
              ? `<div class="text-sm text-slate-600 dark:text-slate-400">${item.desc}</div>`
              : ""
          }
        `;

        const right = document.createElement("div");
        right.className = "md:col-span-2 flex flex-wrap gap-2 content-start";

        const all = [];
        for (const ex of item.class_examples) {
          all.push(ex);
          const chip = document.createElement("button");
          chip.className =
            "px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs hover:bg-slate-200 dark:hover:bg-slate-700";
          chip.textContent = ex;
          chip.title = "Nhấp để copy";
          chip.addEventListener("click", async () => {
            await navigator.clipboard.writeText(ex);
            chip.classList.add("ring-2", "ring-emerald-500");
            setTimeout(
              () => chip.classList.remove("ring-2", "ring-emerald-500"),
              400
            );
          });
          right.appendChild(chip);
        }

        if (all.length) {
          const copyAll = document.createElement("button");
          copyAll.className =
            "ml-auto md:ml-0 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800";
          copyAll.textContent = "Copy tất cả";
          copyAll.addEventListener("click", async () => {
            await navigator.clipboard.writeText(all.join(" "));
            copyAll.textContent = "Đã copy!";
            setTimeout(() => (copyAll.textContent = "Copy tất cả"), 700);
          });
          right.appendChild(copyAll);
        }

        row.appendChild(left);
        row.appendChild(right);
        listWrap.appendChild(row);
      }

      section.appendChild(listWrap);
      frag.appendChild(section);
    }
  }

  rootEl.appendChild(frag);

  $$(".toggleBtn", rootEl).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const section = e.currentTarget.closest("section");
      const list = section.querySelector(":scope > div.divide-y");
      const collapsed = list.classList.toggle("hidden");
      e.currentTarget.textContent = collapsed ? "Mở rộng" : "Thu gọn";
    });
  });
}
