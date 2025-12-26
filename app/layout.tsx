import type { Metadata } from "next";
import { Merriweather, Playfair_Display, Open_Sans } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import "./globals.css";

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});

const playfair = Playfair_Display({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
});

const openSans = Open_Sans({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-opensans',
});

export const metadata: Metadata = {
  title: "CozyReads",
  description: "Your personal book collection manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${merriweather.variable} ${playfair.variable} ${openSans.variable}`}>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
