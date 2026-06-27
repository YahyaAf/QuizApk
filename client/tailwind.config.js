/**
 * Tailwind Config — SchoolMa
 * ─────────────────────────────────────────────────────────
 * Palette :
 *   #053F5C  → navy   (textes, icônes, boutons principaux)
 *   #F7AD19  → amber  (accent/CTA)
 *   #429EBD  → sky    (secondaire, hover, bordures)
 *   #9FE7F5  → ice    (dark mode text, highlights légers)
 *
 * RÈGLE : backgrounds = blanc/#f7f9fb (light), sombre (dark)
 *         couleurs palette = icônes, boutons, textes, badges
 * ─────────────────────────────────────────────────────────
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Primary (navy → ice) ──────────────────────────
        primary: {
          50: "#edf7fb",
          100: "#cce8f4",
          200: "#9FE7F5",   // ice
          300: "#6dd4eb",
          400: "#429EBD",   // sky
          500: "#2b7fa0",
          600: "#1a6380",
          700: "#053F5C",   // navy ← principal
          800: "#032d43",
          900: "#021c2a",
          950: "#010e15",
        },

        // ── Accent (amber/or) ─────────────────────────────
        accent: {
          50: "#fef9ec",
          100: "#fdeec5",
          200: "#fbd98a",
          300: "#f9c24e",
          400: "#F7AD19",   // amber ← accent
          500: "#d9930f",
          600: "#b5780a",
          700: "#8c5d07",
          800: "#654305",
          900: "#3d2903",
        },

        // ── Aliases ───────────────────────────────────────
        indigo: {
          50: "#edf7fb", 100: "#cce8f4", 200: "#9FE7F5", 300: "#6dd4eb",
          400: "#429EBD", 500: "#2b7fa0", 600: "#1a6380", 700: "#053F5C",
          800: "#032d43", 900: "#021c2a", 950: "#010e15",
        },
        sky: {
          50: "#edf7fb", 100: "#cce8f4", 200: "#9FE7F5", 300: "#6dd4eb",
          400: "#429EBD", 500: "#2b7fa0", 600: "#1a6380", 700: "#053F5C",
          800: "#032d43", 900: "#021c2a", 950: "#010e15",
        },
        cyan: {
          50: "#edf7fb", 100: "#cce8f4", 200: "#9FE7F5", 300: "#6dd4eb",
          400: "#429EBD", 500: "#2b7fa0", 600: "#1a6380", 700: "#053F5C",
          800: "#032d43", 900: "#021c2a", 950: "#010e15",
        },
        amber: {
          50: "#fef9ec", 100: "#fdeec5", 200: "#fbd98a", 300: "#f9c24e",
          400: "#F7AD19", 500: "#d9930f", 600: "#b5780a", 700: "#8c5d07",
          800: "#654305", 900: "#3d2903", 950: "#1e1401",
        },
        yellow: {
          50: "#fef9ec", 100: "#fdeec5", 200: "#fbd98a", 300: "#f9c24e",
          400: "#F7AD19", 500: "#d9930f", 600: "#b5780a", 700: "#8c5d07",
          800: "#654305", 900: "#3d2903", 950: "#1e1401",
        },
        // emerald gardé vert pour success/present
        emerald: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
          800: "#166534", 900: "#14532d", 950: "#052e16",
        },

        // ── Surfaces ──────────────────────────────────────
        dark: {
          bg: "#0f1923",
          surface: "#162130",
          card: "#1e2f40",
          border: "#1e3347",
          hover: "#1a2b3a",
          text: "#e8f4f9",
          muted: "#9FE7F5",
        },
        light: {
          bg: "#f7f9fb",
          surface: "#ffffff",
          card: "#ffffff",
          border: "#e2edf3",
          hover: "#f4f8fa",
          text: "#053F5C",
          muted: "#429EBD",
        },
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        arabic: ["'Cairo'", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },

      backgroundImage: {
        "edu-pattern": "none",
        "dark-pattern": "none",
        "hero-gradient": "none",
        "card-gradient": "none",
      },

      boxShadow: {
        edu: "0 4px 24px -2px rgba(5,63,92,0.10), 0 2px 8px -2px rgba(0,0,0,0.05)",
        "edu-lg": "0 8px 40px -4px rgba(5,63,92,0.15), 0 4px 16px -4px rgba(0,0,0,0.08)",
        "dark-edu": "0 4px 24px -2px rgba(0,0,0,0.35), 0 2px 8px -2px rgba(0,0,0,0.25)",
        "dark-edu-lg": "0 8px 40px -4px rgba(0,0,0,0.45), 0 4px 16px -4px rgba(0,0,0,0.35)",
        "glow-primary": "0 0 16px rgba(5,63,92,0.20)",
        "glow-accent": "0 0 16px rgba(247,173,25,0.35)",
        card: "0 1px 3px rgba(5,63,92,0.04), 0 4px 12px rgba(5,63,92,0.05)",
        "card-hover": "0 4px 20px rgba(5,63,92,0.10), 0 8px 32px rgba(0,0,0,0.06)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in-left": "slideInLeft 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },

      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInLeft: { from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },

      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
