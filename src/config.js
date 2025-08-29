// Đường dẫn nên dùng "./" để deploy dưới subpath (GH Pages)
export const FILES = [
  "./data/tailwind-easy.json",
  "./data/tailwind-medium.json",
  "./data/tailwind-hard.json",
  "./data/tailwind-very-hard.json",
];

export const LEVEL_META = {
  easy: { label: "Dễ", color: "bg-emerald-600" },
  medium: { label: "Trung bình", color: "bg-amber-600" },
  hard: { label: "Khó", color: "bg-rose-600" },
  "very-hard": { label: "Rất khó", color: "bg-indigo-600" },
};
