// src/app/page.tsx (ACTUALIZADO - Server Component)

// Importaciones del Servidor y Next.js
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Importaciones de Componentes y UI (Estáticos o Client Components)
import Link from "next/link";
import { ArrowRight } from 'lucide-react'; // Icono estático
import { Button } from "@/components/ui/button"; // Componente UI (puede ser usado en servidor)
import ExplainerSectionModern from "@/components/ExplainerSection"; // Asumir Server o Client
import PricingSection from "@/components/PricingSection";         // Asumir Server o Client
import HeroImageTransition from "@/components/HeroImageTransition"; // DEBE ser Client Component ('use client' en su archivo)

// Revalidación dinámica si es necesario
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Lógica de Redirección ---
  if (user) {
    // Si el usuario está autenticado, redirige al panel principal
    console.log("Usuario autenticado encontrado en page.tsx (servidor), redirigiendo a /overview"); // Log del servidor
    redirect("/overview");
  }

  // --- Renderizado para Usuarios NO Autenticados ---
  // NOTA: useState, useEffect, y motion.div de antes NO funcionarán aquí.
  console.log("Usuario no autenticado en page.tsx (servidor), renderizando landing page."); // Log del servidor

  return (
    <div className="flex flex-col pt-6 md:pt-12 w-full"> {/* Contenedor principal */}
      {/* Contenido de la Hero Section - SIN animaciones framer-motion directas aquí */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-6 md:px-8 py-6 md:py-10 max-w-7xl w-full mx-auto">
        {/* --- Sección de Texto (Estática) --- */}
        <div className="flex flex-col space-y-4 lg:space-y-5 lg:w-1/2 w-full text-center lg:text-left items-center lg:items-start">
          {/* Contenido de texto sin cambios */}
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Fotos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C66FE] to-[#2539B0]">profesionales</span>
            <br />
            con IA, en <span className="whitespace-nowrap">minutos.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-700 max-w-xl">
            Transforma tus selfies en retratos profesionales desde casa. Nuestra IA genera imágenes de alta calidad perfectas para LinkedIn, CVs y portfolios.
          </p>

          {/* --- Agrupación de CTA, texto italic y login --- */}
          <div className="flex flex-col items-center lg:items-start space-y-3 w-full sm:w-auto pt-2">
            {/* --- BOTÓN REDISEÑADO v3.1 --- */}
            <Button
              asChild
              size="lg"
              // Las clases de hover/active deberían funcionar con CSS normal/Tailwind
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-lg tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md transition-all duration-300 ease-out hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97] active:shadow-[0_0_8px_4px_rgba(76,102,254,0.2)] active:from-[#4C66FE] active:to-[#2539B0]"
            >
              <Link href="/login" className="flex items-center justify-center sm:justify-start gap-2">
                Consigue YA tus fotos
                <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
              </Link>
            </Button>
            {/* --- FIN BOTÓN REDISEÑADO v3.1 --- */}
            <p className="text-sm text-gray-500 italic">
              Resultados rápidos, profesionales y listos para impresionar.
            </p>
            <div className="text-sm text-gray-500">
              <span>¿Ya tienes cuenta? </span>
              <Link className="font-medium text-[#2539B0] hover:text-[#4C66FE] hover:underline" href="/login">
                Iniciar Sesión
              </Link>
            </div>
          </div>
          {/* --- FIN Agrupación CTA --- */}
        </div>

        {/* --- Sección de Imagen --- */}
        <div className="lg:w-1/2 w-full mt-8 lg:mt-0 flex justify-center">
           {/* HeroImageTransition DEBE ser un Client Component para funcionar */}
           <HeroImageTransition />
        </div>
      </div>

      {/* --- Secciones inferiores --- */}
      <ExplainerSectionModern />
      <PricingSection />
      {/* Añade otras secciones si existían */}
    </div>
  );
}