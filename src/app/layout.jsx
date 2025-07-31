import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "FSMS",
  description: "FSMS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <title>FSMS</title>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
