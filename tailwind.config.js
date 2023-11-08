export default {
  content: ["./web/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  experimental: {
    // https://github.com/tailwindlabs/tailwindcss/discussions/7317
    optimizeUniversalDefaults: true,
  },
};
