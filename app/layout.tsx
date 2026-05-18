import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panupongwebstore - Premium Digital Solutions & Design Services",
  description: "Professional web design, development, SEO optimization, and UI/UX design services. Connecting talent with opportunity.",
  keywords: ["web design", "web development", "SEO", "UI/UX", "digital solutions", "freelance"],
  openGraph: {
    title: "Panupongwebstore - Premium Digital Solutions",
    description: "Professional web design, development, SEO optimization, and UI/UX design services.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased scroll-smooth bg-black")}>
        <ClientLayout>
          <LanguageProvider>
            <Header />
            {children}
            <Footer />
          </LanguageProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
