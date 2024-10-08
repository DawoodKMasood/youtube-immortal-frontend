import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import RecoilProvider from "@/components/providers/RecoilProvider";
import NextUIThemeProvider from "@/components/providers/NextUIThemeProvider";

export const metadata = {
  title: "Immortals COD - Videos Portan",
  description: "Official Video Portal Page for Immortals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`} suppressHydrationWarning
      >
        <RecoilProvider>
          <NextUIThemeProvider>
            {children}
          </NextUIThemeProvider>
        </RecoilProvider>
      </body>
    </html>
  );
}
