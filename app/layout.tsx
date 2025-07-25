import type { Metadata } from "next"
import type React from "react"
import { Suspense } from "react"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "U⁵AI²S⁶ - UZAIRAISTUDIO",
  description: "Adventure survival game by UZAIR AI STUDIO",
  generator: "UZAIRAISTUDIO",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
      <body style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
