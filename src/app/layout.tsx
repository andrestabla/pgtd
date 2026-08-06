import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jbMono = JetBrains_Mono({ variable: "--font-jb", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PGTD · Plataforma de Gestión de la Transformación Digital | Algoritmo T",
  description:
    "Plataforma de Gestión de la Transformación Digital de la Universidad Popular del Cesar: madurez, comparación sectorial, mapa estratégico, KPI, roadmap y seguimiento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${jbMono.variable} h-full antialiased`}>
      <body
        className="min-h-full"
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          ["--font-mono" as string]: "var(--font-jb), ui-monospace, monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
