import React from "react";
import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import type { ReactNode } from "react";

export const metadata = {
  title: "CareerEasy Homepage",
  description: "Find your dream job with AI powered matching.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#1E293B] min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
} 