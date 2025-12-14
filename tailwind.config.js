/** @type {import('tailwindcss').Config} */
import scrollbarHide from "tailwind-scrollbar-hide";

module.exports = {
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", "system-ui", "sans-serif"],
                k2d: ["var(--font-k2d)", "system-ui", "sans-serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                chart: {
                    1: "var(--chart-1)",
                    2: "var(--chart-2)",
                    3: "var(--chart-3)",
                    4: "var(--chart-4)",
                    5: "var(--chart-5)",
                },
                sidebar: {
                    DEFAULT: "var(--sidebar)",
                    foreground: "var(--sidebar-foreground)",
                    primary: "var(--sidebar-primary)",
                    "primary-foreground": "var(--sidebar-primary-foreground)",
                    accent: "var(--sidebar-accent)",
                    "accent-foreground": "var(--sidebar-accent-foreground)",
                    border: "var(--sidebar-border)",
                    ring: "var(--sidebar-ring)",
                },
                "basecard-blue": "#0050FF",
                "basecard-white": "#F0F0F0",
                "basecard-black": "#303030",
                "basecard-gray": "#62748D",
            },
            keyframes: {
                "toast-slide-in": {
                    "0%": { opacity: "0", transform: "translateY(-20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "toast-slide-in": "toast-slide-in 0.3s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate"), scrollbarHide],
};
