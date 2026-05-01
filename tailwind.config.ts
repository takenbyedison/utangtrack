import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10231d",
        paper: "#f6f8f5",
        bay: "#0f7a5f",
        mint: "#e7f5ef",
        moss: "#22543d",
        mango: "#b7791f",
        clay: "#b42318"
      }
    }
  },
  plugins: []
};

export default config;
