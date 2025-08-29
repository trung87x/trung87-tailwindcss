Tuyển gọn hết main.js thành các “tính năng” riêng như sau. Bạn chỉ cần tạo các file đúng tên, copy code vào, và giữ nguyên `<script type="module" src="./src/main.js"></script>`.

---

### 1) Cấu trúc thư mục đề xuất

```
src/
  main.js
  theme-init.js
  features/
    theme-toggle.js
    drawer.js
    search.js
    export-json.js
  data/
    data.js
  render/
    filters.js
    content.js
    toc.js
  utils/
    dom.js
    slugify.js
  config.js
```

---

### 2) `src/config.js`

```js
// Đường dẫn nên dùng "./" để deploy dưới subpath (GH Pages)
export const FILES = [
  "./data/tailwind-easy.json",
  "./data/tailwind-medium.json",
  "./data/tailwind-hard.json",
  "./data/tailwind-very-hard.json",
];

export const LEVEL_META = {
  easy:      { label: "Dễ",        color: "bg-emerald-600" },
  medium:    { label: "Trung bình",color: "bg-amber-600"   },
  hard:      { label: "Khó",       color: "bg-rose-600"    },
  "very-hard": { label: "Rất khó", color: "bg-indigo-600"  },
};
```

---

### 3) `src/utils/dom.js`

```js
export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
```

### 4) `src/utils/slugify.js`

```js
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
```

---

### 5) `src/data/data.js`

```js
import { FILES } from "../config.js";
import { slugify } from "../utils/slugify.js";

export async function loadData() {
  const results = await Promise.all(
    FILES.map((f) => fetch(f).then(r => (r.ok ? r.json() : null)).catch(() => null))
  );
  const data = results.filter(Boolean);
  return data.length ? data : getFallbackData();
}

export function getFallbackData() {
  return [
    {
      level: "easy",
      categories: [
        {
          name: "Typography",
          description: "Kiểu chữ cơ bản",
          items: [
            { name: "font-size", desc: "Cỡ chữ", class_examples: ["text-base","text-lg","text-2xl"] },
            { name: "text-color", desc: "Màu chữ", class_examples: ["text-slate-900","text-emerald-600"] },
          ],
        },
      ],
    },
  ];
}

export function normalize(datasetArray) {
  const categories = [];
  for (const ds of datasetArray) {
    const level = ds.level || "easy";
    for (const c of (ds.categories || [])) {
      categories.push({
        id: `${level}-${slugify(c.name)}`,
        level,
        name: c.name,
        description: c.description || "",
        items: (c.items || []).map(it => ({
          name: it.name,
          desc: it.desc || "",
          class_examples: Array.isArray(it.class_examples) ? it.class_examples : [],
        })),
      });
    }
  }
  return categories;
}
```

---

### 6) `src/render/filters.js`

```js
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
```

---

### 7) `src/render/content.js`

```js
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
    if (it.class_examples.some((ex) => ex.toLowerCase().includes(q))) return true;
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
    h.className = "flex items-center gap-2 text-lg md:text-xl font-semibold mt-6 mb-3";
    h.innerHTML = `<span class="inline-block w-2 h-2 rounded-full ${meta.color}"></span>${meta.label}`;
    frag.appendChild(h);

    for (const cat of list) {
      const section = document.createElement("section");
      section.id = cat.id;
      section.className = "mb-4 md:mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur";

      const head = document.createElement("div");
      head.className = "px-4 md:px-5 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800 flex items-start md:items-center gap-3";
      head.innerHTML = `
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <a href="#${cat.id}" class="font-semibold hover:underline">${cat.name}</a>
            <span class="text-[10px] px-2 py-0.5 rounded-full text-white ${meta.color}">${meta.label}</span>
          </div>
          ${cat.description ? `<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">${cat.description}</p>` : ""}
        </div>
        <button class="toggleBtn text-xs rounded-lg border px-2 py-1">Thu gọn</button>
      `;
      section.appendChild(head);

      const listWrap = document.createElement("div");
      listWrap.className = "divide-y divide-slate-200 dark:divide-slate-800";

      for (const item of cat.items) {
        const row = document.createElement("div");
        row.className = "px-4 md:px-5 py-3 md:py-4 grid grid-cols-1 md:grid-cols-3 gap-3";

        const left = document.createElement("div");
        left.innerHTML = `
          <div class="font-medium">${item.name}</div>
          ${item.desc ? `<div class="text-sm text-slate-600 dark:text-slate-400">${item.desc}</div>` : ""}
        `;

        const right = document.createElement("div");
        right.className = "md:col-span-2 flex flex-wrap gap-2 content-start";

        const all = [];
        for (const ex of item.class_examples) {
          all.push(ex);
          const chip = document.createElement("button");
          chip.className = "px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs hover:bg-slate-200 dark:hover:bg-slate-700";
          chip.textContent = ex;
          chip.title = "Nhấp để copy";
          chip.addEventListener("click", async () => {
            await navigator.clipboard.writeText(ex);
            chip.classList.add("ring-2", "ring-emerald-500");
            setTimeout(() => chip.classList.remove("ring-2", "ring-emerald-500"), 400);
          });
          right.appendChild(chip);
        }

        if (all.length) {
          const copyAll = document.createElement("button");
          copyAll.className = "ml-auto md:ml-0 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800";
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
```

---

### 8) `src/render/toc.js`

```js
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
        a.className = "block px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800";
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
```

---

### 9) `src/features/search.js`

```js
import { $, $$ } from "../utils/dom.js";

export function bindSearch(state, onChange) {
  const search = $("#search");
  const clear  = $("#clearSearch");

  const updateClearBtn = () => {
    clear.classList.toggle("hidden", !(state.search && state.search.length > 0));
  };

  search.addEventListener("input", () => {
    state.search = search.value.trim();
    updateClearBtn();
    onChange();
  });

  clear.addEventListener("click", () => {
    search.value = "";
    state.search = "";
    updateClearBtn();
    onChange();
  });

  updateClearBtn();
}
```

---

### 10) `src/features/export-json.js`

```js
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
```

---

### 11) `src/features/drawer.js`

```js
import { $, $$ } from "../utils/dom.js";

export function bindDrawer() {
  const drawer = $("#drawer");
  $("#mobileMenuBtn").addEventListener("click", () => drawer.classList.remove("hidden"));
  $$("[data-close]", drawer).forEach((el) =>
    el.addEventListener("click", () => drawer.classList.add("hidden"))
  );
}
```

---

### 12) `src/features/theme-toggle.js`  *(toggle nút bấm)*

```js
export function mountThemeToggle() {
  const btn  = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  if (!btn || !icon) return;

  const syncIcon = () => {
    icon.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
  };
  syncIcon();

  btn.addEventListener("click", () => {
    const root = document.documentElement;
    const toDark = !root.classList.contains("dark");
    root.classList.toggle("dark", toDark);
    try { localStorage.setItem("theme", toDark ? "dark" : "light"); } catch (_) {}
    syncIcon();
  });
}
```

---

### 13) `src/theme-init.js` *(giữ như đã làm — chạy cực sớm)*

```js
(function () {
  try {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (_) {}
})();
```

---

### 14) `src/main.js` (nhẹ, chỉ “điều phối”)

```js
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
  $("#exportBtn").addEventListener("click", () => exportFiltered(CATEGORIES, STATE));

  // Drawer (mobile)
  bindDrawer();

  // Theme toggle (nút)
  mountThemeToggle();
})();
```

---

### 15) HTML `<head>` (đảm bảo thứ tự)

```html
<!-- Áp dụng theme sớm để tránh FOUC -->
<script src="./src/theme-init.js"></script>

<!-- Ép Tailwind dark mode theo class -->
<script>tailwind.config = { darkMode: "class" };</script>

<!-- Tailwind CDN -->
<script src="https://cdn.tailwindcss.com"></script>

<link rel="stylesheet" href="./src/style.css" />
```

---

Xong! Từ giờ:

* **Dark mode**: `theme-init.js` (áp dụng sớm) + `features/theme-toggle.js` (nút).
* **Dữ liệu**: `data/data.js`.
* **Render**: `render/*`.
* **Tương tác UI**: `features/*`.
* **Tiện ích**: `utils/*`.
* **main.js** chỉ điều phối & boot.
