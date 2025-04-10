// src/app/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// --- IMPORTACIONES DE COMPONENTES ---
import HeroSection from "@/components/home/HeroSection";
import ExplainerSection from "@/components/home/ExplainerSection";
import KeyFeaturesSection from "@/components/home/FeaturesSection";
import { PricingCards } from '@/components/PricingCards'; 
import { getPricingPackages } from '@/lib/pricing'; 
import GallerySection from "@/components/home/GallerySection";

export const dynamic = "force-dynamic";
export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Lógica de Redirección (Sin cambios) ---
  if (user) {
    redirect("/overview");
  }

  const packages = await getPricingPackages();

  return (
    <div className="flex flex-col md:pt-12 w-full">

      <HeroSection />
      <GallerySection/>
      <ExplainerSection/>
      <KeyFeaturesSection />
      <div id="precios" className="w-full py-20 md:py-28"> 
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16 md:mb-20 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Planes a tu medida
              </h2>
              <div className="mt-6 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
          </div>
          <PricingCards packages={packages} user={null} />
        </div>
      </div>

    </div> 
  );
}