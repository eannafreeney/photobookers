import Alpine from "alpinejs";
import ajax from "@imacrayon/alpine-ajax";
import focus from "@alpinejs/focus";
import morph from "@alpinejs/morph";
import intersect from "@alpinejs/intersect";
import persist from "@alpinejs/persist";
import resize from "@alpinejs/resize";
import collapse from "@alpinejs/collapse";

import "../styles/styles.css";
import "./";

Alpine.plugin(collapse);
Alpine.plugin(morph);
Alpine.plugin(ajax);
Alpine.plugin(focus);
Alpine.plugin(intersect);
Alpine.plugin(persist);
Alpine.plugin(resize);

window.Alpine = Alpine;
Alpine.start();
