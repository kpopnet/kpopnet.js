export default {
  content: ["./web/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        body: "var(--body)",
        "body-bg": "var(--body-bg)",
        link: "var(--link)",
        "link-hover": "var(--link-hover)",
        control: "var(--control)",
        "control-hover": "var(--control-hover)",
        "kngray-1": "var(--kngray-1)",
      },
      spacing: {
        icon: "var(--icon-size)",
        "icon-sm": "var(--icon-size-small)",
        "cnt-top": "var(--content-margin-top)",
        "cnt-next": "var(--content-margin-next)",
        "cnt-last": "var(--content-margin-last)",
      },
    },
  },
  plugins: [],
  experimental: {
    // https://github.com/tailwindlabs/tailwindcss/discussions/7317
    optimizeUniversalDefaults: true,
  },
};
