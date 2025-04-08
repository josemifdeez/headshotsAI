// app/get-credits/page.tsx

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import { GetCreditsClientPart } from "@/components/GetCreditsClientPart"; // Ajusta la ruta

// --- ¡NUEVO! Importar Stripe ---
import Stripe from 'stripe';

export const dynamic = "force-dynamic";

// --- ¡NUEVO! Instanciar Stripe (¡Necesita la clave secreta!) ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error("FATAL ERROR: STRIPE_SECRET_KEY is not defined in server environment!");
    // Considera lanzar un error o manejarlo de forma que impida continuar si es crítico
}
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-08-16' }) : null;


// --- Datos base de los Paquetes (sin precio monetario hardcodeado) ---
const creditPackagesData = [
  {
    id: "one-credit",
    title: "Starter Pack",
    price: "1 Crédito",
    priceSuffix: "/ 4 fotos HD",
    description: "Ideal para probar el servicio o una necesidad puntual.",
    features: [
      "Genera 4 fotos únicas",
      "Resultados de alta calidad",
      "Entrega en ~20 minutos",
    ],
    buttonText: "Comprar 1 Crédito",
    envPriceIdKey: "STRIPE_PRICE_ID_ONE_CREDIT", // Clave para buscar el Price ID
    featured: false,
  },
  {
    id: "three-credits",
    title: "Basic Pack",
    price: "3 Créditos",
    priceSuffix: "/ 12 fotos HD",
    description: "Consigue más variedad para tus perfiles y usos.",
    features: [
      "Genera 12 fotos únicas",
      "Resultados de alta calidad",
      "Entrega en ~20 minutos",
    ],
    buttonText: "Comprar 3 Créditos",
    envPriceIdKey: "STRIPE_PRICE_ID_THREE_CREDITS",
    featured: true,
  },
  {
    id: "five-credits",
    title: "Premium Pack",
    price: "5 Créditos",
    priceSuffix: "/ 20 fotos HD",
    description: "El mejor valor para una presencia online completa.",
    features: [
      "Genera 20 fotos únicas",
      "Resultados de alta calidad",
      "Entrega en ~20 minutos",
    ],
    buttonText: "Comprar 5 Créditos",
    envPriceIdKey: "STRIPE_PRICE_ID_FIVE_CREDITS",
    featured: false,
  },
];

// --- Interfaz actualizada (monetaryPrice sigue siendo string) ---
interface PackageWithPriceId {
  id: string;
  title: string;
  price: string;
  priceSuffix?: string;
  monetaryPrice: string | null; // Puede ser null si falla la obtención
  description: string;
  features: string[];
  buttonText: string;
  featured: boolean;
  stripePriceId: string | null;
}

// --- ¡NUEVO! Helper para formatear el precio ---
function formatStripePrice(amount: number | null, currency: string | null): string | null {
  if (amount === null || currency === null) {
    return null; // O un valor predeterminado como "Precio no disponible"
  }
  // Divide por 100 porque Stripe usa la unidad mínima (céntimos, centavos, etc.)
  const amountInMajorUnit = amount / 100;
  try {
    return new Intl.NumberFormat(undefined, { // Usa el locale del navegador/servidor
      style: 'currency',
      currency: currency.toUpperCase(),
      // minimumFractionDigits: 2, // Puedes ajustar esto si necesitas siempre .00
    }).format(amountInMajorUnit);
  } catch (e) {
    console.error(`Error formatting price: Amount=${amount}, Currency=${currency}`, e);
    // Fallback simple si Intl falla (ej. currency inválida)
    return `${amountInMajorUnit.toFixed(2)} ${currency.toUpperCase()}`;
  }
}


// --- Server Component (Default Export) ---
export default async function GetCreditsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login?message=Necesitas iniciar sesión para comprar créditos");
  }

  // --- ¡NUEVO! Bloque para obtener precios de Stripe ---
  let stripePrices: Record<string, { amount: number | null, currency: string | null }> = {};
  if (stripe) {
    // Obtiene los Price IDs de las variables de entorno
    const priceIdsToFetch = creditPackagesData
      .map(pkg => process.env[pkg.envPriceIdKey])
      .filter((id): id is string => !!id); // Filtra los undefined/null y asegura que son string

    if (priceIdsToFetch.length > 0) {
      try {
        // Crea un array de promesas para obtener todos los precios
        const pricePromises = priceIdsToFetch.map(id => stripe!.prices.retrieve(id));
        const resolvedPrices = await Promise.allSettled(pricePromises); // Usa allSettled para manejar errores individuales

        resolvedPrices.forEach((result, index) => {
          const priceId = priceIdsToFetch[index];
          if (result.status === 'fulfilled') {
            stripePrices[priceId] = {
              amount: result.value.unit_amount,
              currency: result.value.currency,
            };
          } else {
            console.error(`Failed to fetch Stripe price for ID ${priceId}:`, result.reason);
            stripePrices[priceId] = { amount: null, currency: null }; // Marca como fallido
          }
        });
      } catch (error) {
        console.error("Error fetching Stripe prices:", error);
        // Si la llamada general falla, todos los precios serán null
      }
    }
  } else {
      console.error("Stripe client not initialized. Cannot fetch prices.");
  }


  // --- Combinar datos de paquetes con precios de Stripe ---
  const packagesWithPriceIds: PackageWithPriceId[] = creditPackagesData.map(pkg => {
    const priceId = process.env[pkg.envPriceIdKey] || null;
    const stripePriceInfo = priceId ? stripePrices[priceId] : { amount: null, currency: null };

    // Formatea el precio obtenido de Stripe
    const formattedMonetaryPrice = formatStripePrice(
        stripePriceInfo?.amount ?? null, // Usa ?? null para manejar undefined
        stripePriceInfo?.currency ?? null
    );

    const { envPriceIdKey, ...restOfPkg } = pkg;
    return {
      ...restOfPkg,
      stripePriceId: priceId,
      monetaryPrice: formattedMonetaryPrice, // Pasa el precio formateado (o null)
    };
  });

  // --- Validar si TODOS los Price IDs faltan (sin cambios) ---
  const allLinksMissing = packagesWithPriceIds.every(pkg => pkg.stripePriceId === null);
  if (allLinksMissing) {
      // ... (código de error sin cambios) ...
      return ( <div className="w-full py-20 md:py-28 text-center"> <h2 className="text-3xl font-bold text-red-600 mb-4">Error de Configuración</h2> <p className="text-gray-700">Las opciones de compra no están disponibles.</p> <p className="text-sm text-gray-500 mt-2">Contacta con soporte.</p> </div> );
  }


  // --- Renderizado de la página principal (sin cambios en JSX) ---
  return (
    <div className="w-full py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* --- Título y Descripción (sin cambios) --- */}
        <div className="mb-16 md:mb-20 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900"> Consigue Créditos </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"> Elige el paquete que mejor se adapte a tus necesidades. Serás redirigido a Stripe para completar tu compra segura. </p>
          <div className="mt-6 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
        </div>

        {/* --- Renderiza el Componente Cliente, que ahora recibe el precio formateado --- */}
        <GetCreditsClientPart user={user} packagesWithPriceIds={packagesWithPriceIds} />

        {/* --- Texto Adicional de Confianza (sin cambios) --- */}
        <div className="mt-16 text-center text-sm text-gray-500">
            <p>🔒 Tu transacción es 100% segura procesada por Stripe.</p>
            <p className="mt-1">⚡ Los créditos se añadirán a tu cuenta instantáneamente.</p>
        </div>
      </div>
    </div>
  );
}