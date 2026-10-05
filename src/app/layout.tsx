import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTINELA — Central Inteligente de Monitoramento de Suporte",
  description: "Conecte seus grupos de suporte e deixe a IA monitorar atendimento, alunos, dúvidas, conflitos, satisfação e reembolsos 24 horas por dia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-[#FDFBF7]">
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#111827] antialiased selection:bg-[#FFB380]/30 selection:text-[#E65C00]">
        {children}
      </body>
    </html>
  );
}
