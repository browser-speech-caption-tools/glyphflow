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
  themeConfig: {
    navbar: {
      title: "GlyphFlow",
      items: [
        { to: "/", label: "Docs", position: "left" },
        { to: "/getting-started", label: "Get started", position: "left" },
        {
          href: "https://github.com/enumura1/glyphflow",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            { label: "Get started", to: "/getting-started" },
            { label: "API", to: "/api" },
            { label: "Browser support", to: "/browser-support" },
          ],
        },
        {
          title: "Project",
          items: [
            { label: "GitHub", href: "https://github.com/enumura1/glyphflow" },
            { label: "Project scope", to: "/project-scope" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} GlyphFlow contributors.`,
    },
  },
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
