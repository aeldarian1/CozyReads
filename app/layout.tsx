import type { Metadata, Viewport } from "next";
import { Merriweather, Playfair_Display, Open_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { DialogProvider } from '@/contexts/DialogContext';
import { QueryProvider } from '@/components/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageTransition } from '@/components/PageTransition';
import { ScreenReaderAnnouncer } from '@/components/accessibility/ScreenReaderAnnouncer';
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${merriweather.variable} ${playfair.variable} ${openSans.variable}`}>
        <body className="antialiased">
          <ErrorBoundary>
            <QueryProvider>
              <ThemeProvider>
                <ToastProvider>
                  <DialogProvider>
                    <ScreenReaderAnnouncer />
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </DialogProvider>
                </ToastProvider>
              </ThemeProvider>
            </QueryProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
