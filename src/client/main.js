import Alpine from "alpinejs";
import ajax from "@imacrayon/alpine-ajax";
import focus from "@alpinejs/focus";
import intersect from "@alpinejs/intersect";

import "../styles/styles.css";
import "./";

window.Alpine = Alpine;
Alpine.plugin(ajax);
Alpine.plugin(focus);
Alpine.plugin(intersect);

Alpine.start();
