/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom dark mode palette
                background: '#121212',
                surface: '#1E1E1E',
                primary: '#3B82F6', // Blue-500
                secondary: '#10B981', // Emerald-500
                accent: '#8B5CF6', // Violet-500
                text: '#E5E7EB', // Gray-200
                muted: '#9CA3AF', // Gray-400
            },
        },
    },
    plugins: [],
}
