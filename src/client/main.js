import Alpine from "alpinejs";
import ajax from "@imacrayon/alpine-ajax";
import focus from "@alpinejs/focus";
import morph from "@alpinejs/morph";
import intersect from "@alpinejs/intersect";
import persist from "@alpinejs/persist";

import "../styles/styles.css";
import "./";

Alpine.plugin(morph);
Alpine.plugin(ajax);
Alpine.plugin(focus);
Alpine.plugin(intersect);
Alpine.plugin(persist);
window.Alpine = Alpine;
Alpine.start();
