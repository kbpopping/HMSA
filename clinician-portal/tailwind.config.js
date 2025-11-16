/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#607afb",
        "background-light": "#f5f6f8",
        "background-dark": "#0f1323",
        "foreground-light": "#111827",
        "foreground-dark": "#f9fafb",
        "card-light": "#ffffff",
        "card-dark": "#1f2937",
        "subtle-light": "#9ca3af",
        "subtle-dark": "#6b7280",
        "border-light": "#e5e7eb",
        "border-dark": "#374151",
        // Legacy support
        "text-light": "#111827",
        "text-dark": "#f3f4f6",
      },
      fontFamily: {
        sans: ["Saira", "sans-serif"],
        inconsolata: ['Inconsolata', 'monospace']
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px"
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "soft-lg": "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)"
      }
    }
  },
  plugins: [],
}

