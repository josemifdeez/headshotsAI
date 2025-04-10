// src/lib/pricing.ts
import Stripe from 'stripe';
import 'server-only'; // Ensure this only runs on the server

// --- Instantiate Stripe (Server-side only) ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
    console.error("FATAL ERROR: STRIPE_SECRET_KEY is not defined in server environment!");
    // Consider throwing an error or handling appropriately
}
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-08-16', typescript: true }) : null;

// --- Base Package Data (Shared) ---
// Updated with priceSuffix
export const baseCreditPackages = [
  {
    id: "one-credit",
    title: "Paquete Esencial",
    subtitle: "Ideal para una necesidad puntual.",
    priceDescription: "/ 1 Crédito", // Description based on credits (optional to display)
    priceSuffix: "/ 4 fotos",       // <-- ADDED: Exact text to display next to price
    features: [
      "1 Crédito incluido",
      "4 Fotos únicas generadas por IA",
      "Entrega en ~20 minutos",
    ],
    buttonTextBase: "Seleccionar", // Base text for button (e.g., "Seleccionar" or "Comprar")
    envPriceIdKey: "STRIPE_PRICE_ID_ONE_CREDIT",
    featured: false,
  },
  {
    id: "three-credits",
    title: "Paquete Profesional",
    subtitle: "Nuestra opción más popular y equilibrada.",
    priceDescription: "/ 3 Créditos",
    priceSuffix: "/ 12 fotos",      // <-- ADDED
    features: [
      "3 Créditos incluidos",
      "12 Fotos únicas generadas por IA",
      "Entrega en ~20 minutos",
      "Soporte por email prioritario",
    ],
    buttonTextBase: "Seleccionar",
    envPriceIdKey: "STRIPE_PRICE_ID_THREE_CREDITS",
    featured: true,
  },
  {
    id: "five-credits",
    title: "Paquete Avanzado",
    subtitle: "El mejor valor para una presencia online completa.",
    priceDescription: "/ 5 Créditos",
    priceSuffix: "/ 20 fotos",      // <-- ADDED
    features: [
      "5 Créditos incluidos",
      "20 Fotos únicas generadas por IA",
      "Entrega en ~20 minutos",
      "Soporte por email prioritario",
    ],
    buttonTextBase: "Seleccionar",
    envPriceIdKey: "STRIPE_PRICE_ID_FIVE_CREDITS",
    featured: false,
  },
];

// --- Interface for Enriched Package ---
// Updated with priceSuffix
export interface PricingPackage {
  id: string;
  title: string;
  subtitle: string;
  priceDescription: string; // e.g., "/ 1 Crédito" (informational)
  priceSuffix: string;      // <-- ADDED: e.g., "/ 4 fotos" (for display)
  monetaryPrice: string | null; // e.g., "9 €" or null if error/not found
  features: string[];
  buttonTextBase: string;   // Base text (will be combined with plan name or credits)
  featured: boolean;
  stripePriceId: string | null; // The actual Stripe Price ID
}

// --- Helper to Format Stripe Price ---
// (Handles currency and decimal places)
function formatStripePrice(amount: number | null, currency: string | null): string | null {
  if (amount === null || currency === null) {
    return null; // Return null if price data is incomplete
  }
  const amountInMajorUnit = amount / 100; // Convert cents/pence to dollars/euros etc.
  try {
    // Use Intl.NumberFormat for locale-aware currency formatting
    return new Intl.NumberFormat(undefined, { // Use browser/server default locale
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: (amountInMajorUnit % 1 === 0) ? 0 : 2, // Show 0 decimals if it's a whole number
      maximumFractionDigits: 2,
    }).format(amountInMajorUnit);
  } catch (e) {
    console.error(`Error formatting price: Amount=${amount}, Currency=${currency}`, e);
    // Fallback to simple formatting if Intl fails
    return `${amountInMajorUnit.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

// --- Async Function to Get Packages with Prices ---
// Fetches prices from Stripe and combines with base data
export async function getPricingPackages(): Promise<PricingPackage[]> {
  if (!stripe) {
    console.error("Stripe client not initialized. Returning packages without monetary prices.");
    // Return base packages with null monetary price if Stripe isn't configured
    return baseCreditPackages.map(pkg => {
        const { envPriceIdKey, ...restOfPkg } = pkg;
        return {
            ...restOfPkg,
            monetaryPrice: null,
            stripePriceId: process.env[pkg.envPriceIdKey] || null,
        };
    });
  }

  // Get the list of Stripe Price IDs from environment variables based on our packages
  const priceIdsToFetch = baseCreditPackages
    .map(pkg => process.env[pkg.envPriceIdKey])
    .filter((id): id is string => !!id); // Filter out any undefined/null IDs

  let stripePrices: Record<string, { amount: number | null, currency: string | null }> = {};

  if (priceIdsToFetch.length > 0) {
    try {
      // Fetch all prices from Stripe concurrently
      const pricePromises = priceIdsToFetch.map(id => stripe!.prices.retrieve(id));
      const resolvedPrices = await Promise.allSettled(pricePromises);

      // Process the results
      resolvedPrices.forEach((result, index) => {
        const priceId = priceIdsToFetch[index];
        if (result.status === 'fulfilled' && result.value) {
           // Store successfully fetched price data
           stripePrices[priceId] = {
             amount: result.value.unit_amount, // Amount in cents/pence
             currency: result.value.currency,
           };
        } else {
          // Log error if a price fetch failed
          console.error(`Failed to fetch Stripe price for ID ${priceId}:`, result.status === 'rejected' ? result.reason : 'Unknown error');
          stripePrices[priceId] = { amount: null, currency: null }; // Mark as failed/not found
        }
      });
    } catch (error) {
      console.error("Error fetching Stripe prices:", error);
      // Decide error handling: return empty array, or packages without prices?
      // Current implementation continues and returns packages with null prices for failed fetches.
    }
  } else {
      console.warn("No Stripe Price IDs found in environment variables based on baseCreditPackages.");
  }

  // --- Combine base package data with fetched Stripe prices ---
  const enrichedPackages: PricingPackage[] = baseCreditPackages.map(pkg => {
    const priceId = process.env[pkg.envPriceIdKey] || null;
    // Get the fetched price info, default to nulls if not found or fetch failed
    const stripePriceInfo = priceId ? (stripePrices[priceId] || { amount: null, currency: null }) : { amount: null, currency: null };

    // Format the monetary price for display
    const formattedMonetaryPrice = formatStripePrice(
        stripePriceInfo?.amount,
        stripePriceInfo?.currency
    );

    // Remove the internal env var key from the final package object
    const { envPriceIdKey, ...restOfPkg } = pkg; // restOfPkg now includes priceSuffix

    // Return the complete package object conforming to PricingPackage interface
    return {
      ...restOfPkg, // Includes id, title, subtitle, priceDescription, priceSuffix, features, buttonTextBase, featured
      monetaryPrice: formattedMonetaryPrice, // Formatted price string or null
      stripePriceId: priceId, // The actual Stripe Price ID or null
    };
  });

  return enrichedPackages; // Return the array of enriched packages
}