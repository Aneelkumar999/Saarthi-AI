import type { Metadata } from "next";
<<<<<<< HEAD
=======
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
>>>>>>> origin/main
import "./globals.css";

export const metadata: Metadata = {
  title: "Saarthi AI | Government Service Navigator",
  description: "Your AI guide through government services for Telangana citizens."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
>>>>>>> origin/main
>>>>>>> origin/main
    </html>
  );
}
