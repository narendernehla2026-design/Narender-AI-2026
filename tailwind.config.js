module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          900: "#071129",
          800: "#041025",
          700: "#021524",
          600: "#0f172a"
        },
        primary: {
          50: "#f8f9fa",
          100: "#f0f2f5",
          200: "#e1e4e8",
          300: "#d0d5dd",
          400: "#b8c1cc",
          500: "#9ca3af",
          600: "#7d8590",
          700: "#626977",
          800: "#424a53",
          900: "#1f2937"
        },
        workshop: {
          bg: "#ffffff",
          card: "#f8f9fa",
          border: "#e1e4e8",
          text: "#1f2937",
          textSecondary: "#6b7280",
          blue: "#0066ff",
          blueDark: "#0052cc",
          purple: "#8b5cf6",
          purpleDark: "#7c3aed",
          emerald: "#10b981",
          emeraldDark: "#059669"
        }
      }
    }
  },
  plugins: []
};
