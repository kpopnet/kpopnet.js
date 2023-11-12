export default {
  content: ["./web/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        body: "#333",
        "body-bg": "hsl(275, 10%, 94%)",
        link: "hsl(275, 25%, 40%)",
        "link-hover": "hsl(275, 15%, 60%)",
        control: "theme(colors.link)",
        "control-hover": "theme(colors.link-hover)",
        "kngray-1": "#ccc",
      },
      spacing: {
        icon: "24px",
        "icon-sm": "16px",
        "icon-lg": "32px",
        "cnt-top": "var(--cnt-top)",
        "cnt-next": "var(--cnt-next)",
        "cnt-last": "var(--cnt-last)",
      },
      screens: {
        md: "800px",
      },
      fontSize: {
        lg: ["18px", "24px"],
      },
      fontFamily: {
        sans: ["Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
  experimental: {
    // https://github.com/tailwindlabs/tailwindcss/discussions/7317
    optimizeUniversalDefaults: true,
  },
};
