import type { Metadata } from "next";
<<<<<<< HEAD
import "./globals.css";

export const metadata: Metadata = {
  title: "Saarthi AI | Government Service Navigator",
  description: "Your AI guide through government services for Telangana citizens."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
=======
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saarthi AI - Your Government Guide",
  description: "Guiding Citizens Through Government Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
>>>>>>> origin/main
    </html>
  );
}
