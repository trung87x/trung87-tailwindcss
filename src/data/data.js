import { FILES } from "../config.js";
import { slugify } from "../utils/slugify.js";

console.log(FILES);

export async function loadData() {
  const results = await Promise.all(
    FILES.map(async (url) => {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
      } catch (e) {
        console.warn("Fetch failed:", url, e); // ← xem Console để biết 404/CORS
        return null;
      }
    })
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
            {
              name: "font-size",
              desc: "Cỡ chữ",
              class_examples: ["text-base", "text-lg", "text-2xl"],
            },
            {
              name: "text-color",
              desc: "Màu chữ",
              class_examples: ["text-slate-900", "text-emerald-600"],
            },
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
    for (const c of ds.categories || []) {
      categories.push({
        id: `${level}-${slugify(c.name)}`,
        level,
        name: c.name,
        description: c.description || "",
        items: (c.items || []).map((it) => ({
          name: it.name,
          desc: it.desc || "",
          class_examples: Array.isArray(it.class_examples)
            ? it.class_examples
            : [],
        })),
      });
    }
  }
  return categories;
}
