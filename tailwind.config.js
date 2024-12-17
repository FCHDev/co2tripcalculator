/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#264653',    // Bleu foncé - Fond principal
        secondary: '#2a9d8f',  // Turquoise - Accents et textes importants
        accent: '#e9c46a',     // Jaune - Boutons et éléments interactifs
        highlight: '#f4a261',  // Orange clair - Alertes et notifications
        warning: '#e76f51',    // Orange foncé - Erreurs et avertissements
      }
    },
  },
  plugins: [],
} 