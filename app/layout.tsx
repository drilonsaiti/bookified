import type { Metadata } from "next";
import {IBM_Plex_Serif, Mona_Sans} from "next/font/google";

import Navbar from "@/components/Navbar";
import "./globals.css";


const ibmPlexSerif = IBM_Plex_Serif({
  variable: '--font-ibm-plex-serf',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'] ,
  display: 'swap'
})

const monaSans = Mona_Sans({
  variable: '--font-mona-sans',
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: "Bookified",
  description: "Transform your books into interactive AI conversations. Upload PDFs, and chat with your books using voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSerif.variable} ${monaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative font-sans antialiased">
      <Navbar />

      {children}

      </body>
    </html>
  );
}
