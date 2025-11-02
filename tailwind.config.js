// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nbPrimary: "#0a3d62",   // fondo general (login)
        nbPrimaryLight: "#2d63b4",
        nbAccent: "#e63946",
        nbButton: "#3843c2",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};
