import { $, $$ } from "../utils/dom.js";

export function bindSearch(state, onChange) {
  const search = $("#search");
  const clear = $("#clearSearch");

  const updateClearBtn = () => {
    clear.classList.toggle(
      "hidden",
      !(state.search && state.search.length > 0)
    );
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
