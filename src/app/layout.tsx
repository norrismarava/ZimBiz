import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ZimBiz Connect — Zimbabwe's Trusted Business Network",
    template: "%s | ZimBiz Connect",
  },
  description:
    "Discover Zimbabwean businesses, inspect verified information, compare quotations and learn from genuine customer experiences.",
  keywords: ["Zimbabwe", "business", "directory", "verification", "quotations", "trusted", "Harare", "Bulawayo"],
  openGraph: {
    title: "ZimBiz Connect — Zimbabwe's Trusted Business Network",
    description: "Discover. Verify. Connect. Find businesses you can check before you choose.",
    type: "website",
    locale: "en_ZW",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8FAF9]">
        <Header userName={user?.name} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
