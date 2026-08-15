import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AtendeAI",
  description: "Sistema inteligente de gerenciamento de atendimentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-zinc-950 text-white md:flex">
          <Sidebar />

          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}