/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
                serif: ["Playfair Display", ...defaultTheme.fontFamily.serif],
            },
            colors: {
                background: "#fafaf9", // Stone-50 (Warm White) - Page Background
                foreground: "#1c1917", // Stone-900 (Black Tone) - Body Text

                primary: {
                    DEFAULT: "#c2410c", // Orange-700 (Faded Dark Orange) - Main Brand Color (Buttons, Links)
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#57534e", // Stone-600 (Warm Brownish Gray) - Subtitles, Muted Text
                    foreground: "#fafaf9",
                },
                accent: {
                    DEFAULT: "#c2410c", // Keeping Accent same as Primary for consistency
                    foreground: "#ffffff",
                },
                card: {
                    DEFAULT: "#ffffff",
                    foreground: "#1c1917",
                },
                border: "#e7e5e4", // Stone-200
                muted: {
                    DEFAULT: "#f5f5f4", // Stone-100
                    foreground: "#78716c", // Stone-500
                },
            },
            borderRadius: {
                xl: "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            boxShadow: {
                soft: "0 4px 20px -2px rgba(28, 25, 23, 0.05)", // Shadow using Stone color
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
