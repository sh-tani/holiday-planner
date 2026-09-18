import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/AuthContext"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "休日プランナー | 天気と予定で休日をもっと楽しむ",
  description:
    "天気と予定をまとめて管理して、最高の休日プランを見つけるプロトタイプ。",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fffaf7",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="bg-background">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}