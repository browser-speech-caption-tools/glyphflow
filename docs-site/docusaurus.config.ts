import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "GlyphFlow",
  tagline: "Web Speech captions with a smooth word wipe",
  favicon: "img/favicon.svg",
  url: "https://speech-caption.github.io",
  baseUrl: "/glyphflow/",
  organizationName: "speech-caption",
  projectName: "glyphflow",
  onBrokenLinks: "throw",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
    localeConfigs: {
      ja: { label: "日本語" },
    },
  },
  themeConfig: {
    image: "img/ogp.png",
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "GlyphFlow",
      logo: {
        alt: "GlyphFlow",
        src: "img/favicon.svg",
        width: 28,
        height: 28,
      },
      items: [
        { to: "/docs", label: "Docs", position: "left" },
        { to: "/docs/getting-started", label: "Get started", position: "left" },
        {
          href: "https://github.com/speech-caption/glyphflow",
          label: "GitHub",
          position: "right",
        },
        { type: "localeDropdown", position: "right" },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            { label: "Get started", to: "/docs/getting-started" },
            { label: "API", to: "/docs/api" },
            { label: "Browser support", to: "/docs/browser-support" },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/speech-caption/glyphflow",
            },
            { label: "Project scope", to: "/docs/project-scope" },
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
        docs: { routeBasePath: "/docs" },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
};

export default config;
