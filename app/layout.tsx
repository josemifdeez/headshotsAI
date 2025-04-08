// src/app/layout.tsx
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar"; // Tu Navbar Server Component
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from 'next';

// 👇 AÑADE ESTA LÍNEA AQUÍ 👇
export const dynamic = 'force-dynamic';
// -------------------------- //

export const metadata: Metadata = {
  metadataBase: new URL('https://sesionesfotosia.com'),
  title: {
    default: "Sesiones Fotos IA",
    template: "%s | Sesiones Fotos IA",
  },
  description: "Fotos profesionales para tu CV, LinkedIn o redes sociales generadas por Inteligencia Artificial en minutos.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Dejamos tus cálculos de altura como estaban, aunque Navbar (la server component)
  // puede que no sea sticky de la misma forma que tu NavbarModernV2 original.
  // Asegúrate que el padding-top siga siendo relevante para el diseño actual.
  const stickyNavHeightClass = ""; // Revisa si este valor es correcto para 'Navbar'

  return (
    <html lang="es">
      {/* Clases originales de body */}
      <body className="min-h-screen flex flex-col bg-white overflow-x-hidden lg:overflow-x-visible">


        {/* Usas tu Navbar directamente */}
        <Suspense
          fallback={
             <div className="flex w-full px-4 lg:px-10 py-4 items-center text-center gap-8 justify-start h-[72px] border-b" />
          }
        >
          {/* Como Navbar ahora es dinámica por 'force-dynamic' en el layout, */}
          {/* el Suspense podría no ser estrictamente necesario aquí, pero no hace daño */}
          <Navbar />
        </Suspense>

        {/* Main con el padding-top que calculaste */}
        <main className={`flex flex-1 flex-col items-center ${stickyNavHeightClass} pb-16 md:pb-24`}>
          {children}
        </main>

        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}