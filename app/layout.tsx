import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { CookieNotice } from "@/components/CookieNotice";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

const description =
  "O Slim Play é apenas um reprodutor de mídia. Não fornecemos, hospedamos ou vendemos conteúdos nem playlists de canais.";

export const metadata: Metadata = {
  metadataBase: new URL("https://slimplay.app"),
  title: {
    default: "Slim Play — A sua lista, em reprodução",
    template: "%s · Slim Play",
  },
  description,
  applicationName: "Slim Play",
  openGraph: {
    title: "Slim Play — A sua lista, em reprodução",
    description,
    locale: "pt_BR",
    type: "website",
    siteName: "Slim Play",
  },
};

export const viewport: Viewport = {
  themeColor: "#161616",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} min-h-screen antialiased`}>
        <LanguageProvider>
          <div className="site-bg flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <CookieNotice />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
