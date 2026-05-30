import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#102A43",
        ink: "#1F2937",
        saffron: "#F97316",
        telangana: "#0F766E",
        cream: "#FFF7ED",
        mist: "#F8FAFC"
      },
      boxShadow: {
        civic: "0 18px 60px rgba(16, 42, 67, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Telugu", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
