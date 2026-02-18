// scripts/env.ts
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.scripts") });
if (process.env.ENV === "production") {
  dotenv.config({
    path: resolve(process.cwd(), ".env.production"),
    override: true,
  });
} else {
  dotenv.config();
}
