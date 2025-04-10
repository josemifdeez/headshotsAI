// app/get-credits/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import { getPricingPackages } from '@/lib/pricing';
import { PricingCards } from '@/components/PricingCards';
// --- Import the icons from lucide-react ---
import { ShieldCheck, Coins } from 'lucide-react'; // Import Lock and Coins

export const dynamic = "force-dynamic";

export default async function GetCreditsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login?message=Necesitas iniciar sesión para comprar créditos");
  }

  const packages = await getPricingPackages();

  return (
    <div className="w-full py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* --- Cabecera (sin cambios) --- */}
        <div className="mb-16 md:mb-20 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Consigue Créditos
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Elige el paquete que mejor se adapte a tus necesidades. Serás redirigido a Stripe para completar tu compra segura.
          </p>
          <div className="mt-6 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
        </div>

        {/* --- Componente Unificado --- */}
        <PricingCards packages={packages} user={user} />

        {/* --- Texto Adicional con Iconos de Lucide (Order Swapped) --- */}
        <div className="mt-16 text-center text-sm text-gray-500 space-y-1">
            {/* Line about credits first */}
            <p className="flex items-center justify-center space-x-1.5">
                <Coins className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={2} aria-hidden="true" />
                <span>Los créditos se añadirán a tu cuenta instantáneamente tras la compra.</span>
            </p>
            {/* Line about secure transaction second */}
            <p className="flex items-center justify-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={2} aria-hidden="true" />
                <span>Tu transacción es 100% segura procesada por Stripe.</span>
            </p>
        </div>

      </div>
    </div>
  );
}