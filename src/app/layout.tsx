import type { Metadata } from "next";
import { Heebo, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommunityHub",
  description: "CommunityHub – פלטפורמה לבית כנסת וקהילה",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon-512.png", type: "image/png" }],
    apple: [{ url: "/icon-512.png", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${heebo.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <a href="#main-content" className="skip-link">
          דלג לתוכן המרכזי
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
