import Alpine from "alpinejs";
import ajax from "@imacrayon/alpine-ajax";
import focus from "@alpinejs/focus";

import "../styles/styles.css";
import "./";

window.Alpine = Alpine;
Alpine.plugin(ajax);
Alpine.plugin(focus);

// document.addEventListener('ajax:after', (event) => {
//     const form = event.target.closest('form');
//     if (form) {
//       form.removeAttribute('aria-busy');
//     }
//   });

Alpine.start();
