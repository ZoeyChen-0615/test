import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata = {
  title: "Bookshelf",
  description: "Search for books, save your favorites, see what others are reading.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} dark`}>
        <body className="min-h-screen bg-[#0f0f13] text-[#e4e4ed] font-sans antialiased">
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
