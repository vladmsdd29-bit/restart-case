import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"RESTART CASE", description:"Локальный CS2 case opening demo" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ru"><body>{children}</body></html>; }
