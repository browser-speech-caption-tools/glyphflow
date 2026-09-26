import { readFile } from "node:fs/promises";

const browserEntryUrl = new URL("../dist/index.browser.js", import.meta.url);
const browserEntry = await readFile(browserEntryUrl, "utf8");

if (!browserEntry.includes('import "./styles.css";')) {
  throw new Error("The browser package entry must import the bundled stylesheet.");
}

await import(new URL("../dist/index.js", import.meta.url));
await import("@enumura/glyphflow");
