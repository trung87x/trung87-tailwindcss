import { $, $$ } from "../utils/dom.js";

export function bindDrawer() {
  const drawer = $("#drawer");
  $("#mobileMenuBtn").addEventListener("click", () =>
    drawer.classList.remove("hidden")
  );
  $$("[data-close]", drawer).forEach((el) =>
    el.addEventListener("click", () => drawer.classList.add("hidden"))
  );
}
