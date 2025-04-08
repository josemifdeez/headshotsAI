// src/app/page.tsx (ACTUALIZADO - KeyFeatures después de Explainer)

// Importaciones de Supabase y Next.js (sin cambios)
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// --- IMPORTACIONES DE COMPONENTES ---
import HeroSection from "@/components/home/HeroSection";
import ExplainerSectionModern from "@/components/home/ExplainerSection";
import KeyFeaturesSection from "@/components/home/FeaturesSection"; // <-- Asegúrate de importar KeyFeaturesSection
import PricingSection from "@/components/home/PricingSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Lógica de Redirección (Sin cambios) ---
  if (user) {
    // console.log("Usuario autenticado encontrado en page.tsx (servidor), redirigiendo a /overview");
    redirect("/overview");
  }

  return (
    
    <div className="flex flex-col md:pt-12 w-full">

      {/* --- Componentes de la Landing Page (NUEVO ORDEN) --- */}
      <HeroSection />
      <ExplainerSectionModern />
      <KeyFeaturesSection />   {/* <-- Movido aquí */}
      <PricingSection />

    </div> // Fin Contenedor principal
  );
}