import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand red family sampled directly from the upGrad X logo artwork:
        // wordmark red #E41F26, the "x" gradient runs down to a deep maroon #630408.
        // 2026 refresh ("Bold Editorial"): pure white ground, near-black ink, neutral
        // hairlines. Red stays the single accent — no pink-tinted borders or greys.
        "outline-variant": "#e3e3e3",
        "surface-bright": "#ffffff",
        error: "#ba1a1a",
        "on-tertiary-fixed": "#1b1c1c",
        "on-error-container": "#93000a",
        primary: "#e41f26",
        "secondary-container": "#e2dfde",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#e2e2e2",
        "on-tertiary-container": "#fefcfc",
        "on-secondary-fixed-variant": "#474746",
        "inverse-primary": "#ffb4aa",
        "on-surface": "#111111",
        "on-secondary-fixed": "#1c1b1b",
        outline: "#a3a3a3",
        "inverse-on-surface": "#f1f1f1",
        "surface-container-high": "#e8e8e8",
        background: "#ffffff",
        "primary-fixed": "#fdeaea",
        "tertiary-fixed": "#e3e2e2",
        "surface-variant": "#e2e2e2",
        "on-error": "#ffffff",
        "primary-fixed-dim": "#f2a8a8",
        "on-primary-fixed-variant": "#630408",
        surface: "#ffffff",
        "on-primary": "#ffffff",
        "inverse-surface": "#2f3131",
        "surface-dim": "#dadada",
        "on-tertiary": "#ffffff",
        "on-primary-container": "#fffbff",
        "primary-container": "#b4151a",
        "on-surface-variant": "#5c5c5c",
        "surface-container-low": "#f7f7f7",
        "on-tertiary-fixed-variant": "#464747",
        "on-primary-fixed": "#3a0103",
        "tertiary-fixed-dim": "#c7c6c6",
        "on-secondary": "#ffffff",
        "secondary-fixed": "#e5e2e1",
        tertiary: "#5c5c5c",
        "on-secondary-container": "#636262",
        "tertiary-container": "#747474",
        "error-container": "#ffdad6",
        "on-background": "#111111",
        "surface-tint": "#e41f26",
        secondary: "#5f5e5e",
        "secondary-fixed-dim": "#c8c6c5",
        "surface-container": "#f1f1f1",
        // Near-black surface for the "statement" blocks of the editorial look.
        ink: "#111111",
        // Deepest tone from the logo's "x" gradient — used for 3D shadow/press states.
        "primary-deep": "#630408",
        // Legacy aliases kept for the admin panel (not covered by the Stitch handoff)
        brand: {
          red: "#e41f26",
          redDark: "#b4151a",
          redLight: "#fdeaea",
          ink: "#111111",
          ink2: "#5c5c5c",
          gray: {
            50: "#f7f7f7",
            100: "#f1f1f1",
            200: "#e3e3e3",
            300: "#d4d4d4",
            400: "#5c5c5c",
          },
        },
      },
      borderRadius: {
        DEFAULT: "0.875rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        card: "1.5rem",
        // `full` intentionally left unset so Tailwind's built-in 9999px pill/circle applies —
        // an earlier override here broke every circular avatar/badge into a rounded square.
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,17,0.04)",
        cardHover: "0 24px 48px -20px rgba(17,17,17,0.28)",
        float: "0 20px 50px -12px rgba(17,17,17,0.45)",
        "red-glow": "0 12px 28px -10px rgba(228,31,38,0.55)",
      },
      transitionTimingFunction: {
        // One house curve: fast out, soft landing. Used by every hover/press/enter.
        out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "220ms",
        slow: "400ms",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "soft-pulse": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.2,0.8,0.2,1) both",
        "fade-in": "fade-in 0.2s ease-out both",
        "pop-in": "pop-in 0.28s cubic-bezier(0.2,0.8,0.2,1) both",
        "toast-in": "toast-in 0.3s cubic-bezier(0.2,0.8,0.2,1) both",
        shimmer: "shimmer 1.4s infinite",
        "soft-pulse": "soft-pulse 1.6s ease-in-out infinite",
      },
      spacing: {
        gutter: "16px",
        "section-gap": "32px",
        "card-padding": "16px",
        "container-margin": "24px",
        unit: "4px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        // Tight grotesk for headlines and big numbers — the editorial voice.
        display: ["Inter Tight", "Inter", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "headline-sm": ["20px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "label-bold": ["12px", { lineHeight: "16px", letterSpacing: "0.12em", fontWeight: "700" }],
        "body-lg": ["17px", { lineHeight: "27px", fontWeight: "400" }],
        "stat-lg": ["40px", { lineHeight: "40px", letterSpacing: "-0.04em", fontWeight: "800" }],
        "body-md": ["15px", { lineHeight: "23px", fontWeight: "400" }],
        "display-lg": ["44px", { lineHeight: "46px", letterSpacing: "-0.035em", fontWeight: "800" }],
        "display-xl": ["clamp(56px, 8vw, 112px)", { lineHeight: "0.92", letterSpacing: "-0.045em", fontWeight: "800" }],
        "body-sm": ["13px", { lineHeight: "19px", fontWeight: "400" }],
        "headline-md": ["28px", { lineHeight: "32px", letterSpacing: "-0.025em", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default config;
