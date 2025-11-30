import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import WelcomeModal from "../components/WelcomeModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarbonX | AI + Web3 Carbon Credit Exchange",
  description: "Buy, sell, and offset carbon credits with AI and blockchain.",
  icons: {
    icon: "/favicon-v2.ico",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThirdwebProvider>

          <WelcomeModal />
          <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
