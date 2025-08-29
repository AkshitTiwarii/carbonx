// NOTE: This duplicate layout under frontend/app is likely legacy and can cause
// extra chunks or confusion with the primary App Router in src/app.
// Prefer removing this folder or consolidating into src/app.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarbonX | AI + Web3 Carbon Credit Exchange",
  description:
    "Buy, sell, and offset carbon credits with AI and blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}
