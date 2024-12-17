import type { Metadata } from "next";
import "./globals.css";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
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
      <body className={`${inter.className} ${poppins.className} min-h-screen bg-[#353036]`}>
        {children}
      </body>
    </html>
  );
}
