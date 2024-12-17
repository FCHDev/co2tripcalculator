import type { Metadata } from "next";
import "./globals.css";
import { Inter, Poppins } from 'next/font/google';

// Configuration de Inter
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

// Configuration de Poppins
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Calculateur CO₂ - Voyage",
  description: "Calculez l'empreinte carbone de vos voyages en avion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
