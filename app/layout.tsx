// src/app/layout.tsx
import Footer from "@/components/Footer";
// --- IMPORTA AMBOS NAVBARS Y EL SWITCHER ---              // Tu Navbar original
import Navbar from "@/components/Navbar"; 
// --- FIN IMPORTS ---
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://sesionesfotosia.pro'), // ¡Asegúrate que esta sea tu URL de producción!
  title: {
    default: "Sesiones Fotos IA",
    template: "%s | Sesiones Fotos IA",
  },
  description: "Fotos profesionales para tu CV, LinkedIn o redes sociales generadas por Inteligencia Artificial en minutos.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  // --- Calcula (aproximadamente) la altura de la navbar sticky (NavbarModernV2) ---
  // NavbarModernV2 tiene: h-14 (3.5rem = 56px) + py-3 (0.75rem*2 = 1.5rem = 24px) = 5rem (80px)
  // Usaremos este valor para el padding-top del <main> para evitar solapamiento.
  const stickyNavHeightClass = "pt-20"; // pt-20 en Tailwind es 5rem / 80px

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-white"> {/* Añadido bg-white o tu color de fondo base */}

        {/* --- USA EL NAVBAR SWITCHER AQUÍ --- */}
        {/* Ya no necesitas la <section> extra a menos que la uses para algo más */}
        <Suspense
          fallback={
            // El fallback debería reflejar la altura de la *primera* navbar (Navbar)
            // Navbar tiene py-4 (1rem*2 = 2rem) + contenido (aprox 40px logo + texto). Estimemos ~72px
             <div className="flex w-full px-4 lg:px-10 py-4 items-center text-center gap-8 justify-start h-[72px] border-b" /> // Ajusta h-[...] si es necesario
          }
        ><Navbar/>
        </Suspense>
        {/* --- FIN NAVBAR SWITCHER --- */}

        {/* Ajusta el padding de <main>:
            - Elimina py-16 original.
            - Añade padding-top igual a la altura de la navbar sticky (NavbarModernV2)
            - Añade un padding-bottom si lo necesitas (p.ej., pb-16 o pb-24) */}
        <main className={`flex flex-1 flex-col items-center ${stickyNavHeightClass} pb-16 md:pb-24`}> {/* Aplicado pt y pb */}
          {children}
        </main>

        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}