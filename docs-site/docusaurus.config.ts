import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "GlyphFlow",
  tagline: "Web Speech captions with a smooth word wipe",
  favicon: "img/favicon.ico",
  url: "https://enumura1.github.io",
  baseUrl: "/glyphflow/",
  organizationName: "enumura1",
  projectName: "glyphflow",
  onBrokenLinks: "throw",
  presets: [
    [
      "classic",
      {
        docs: { routeBasePath: "/" },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
};

export default config;
