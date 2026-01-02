import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ProfileGuard from "@/components/ProfileGuard"; // <--- 1. IMPORTAR ESTO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Propuesta Monster",
  description: "Presupuestos de alto impacto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ProfileGuard>  
            {children}
          </ProfileGuard> 
        </AuthProvider>
      </body>
    </html>
  );
}