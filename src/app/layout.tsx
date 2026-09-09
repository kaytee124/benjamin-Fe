import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GED Math Practice",
  description:
    "Timed Mathematical Reasoning practice test with a 46-question bank and on-screen calculator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
