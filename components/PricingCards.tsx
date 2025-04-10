// src/components/shared/PricingCards.tsx
'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { PricingPackage } from '@/lib/pricing'; // Import the updated interface
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils"; // Ensure "@/lib/utils" exists and exports cn

interface PricingCardsProps {
  packages: PricingPackage[];
  user: User | null; // User object if logged in, null otherwise
  className?: string; // Optional additional class for the grid container
}

export function PricingCards({ packages, user, className = "" }: PricingCardsProps) {
    const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- Function to handle initiating the Stripe Checkout session ---
    const handlePurchase = async (priceId: string | null, packageId: string) => {
        // Prevent purchase if Stripe Price ID is missing
        if (!priceId) {
            setError(`Error: Configuración de pago incompleta para ${packageId}.`);
            console.error(`Stripe Price ID is missing for package ${packageId}`);
            return;
        }
        // Ensure user is logged in before attempting purchase
        if (!user) {
             setError("Necesitas iniciar sesión para comprar.");
             console.warn("Attempted purchase without user session.");
             return;
        }

        setLoadingPackageId(packageId); // Set loading state for this specific package
        setError(null); // Clear previous errors
        try {
            // Call the API route to create a checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ priceId }), // Send the selected price ID
            });
            const data = await response.json();

            if (!response.ok) {
                 // Throw error from API response or a generic one
                 throw new Error(data.error || 'No se pudo iniciar la sesión de pago. Inténtalo de nuevo.');
            }
            if (data.url) {
                // Redirect the user to Stripe Checkout page
                window.location.href = data.url;
            } else {
                // This shouldn't happen if API is correct, but handle defensively
                throw new Error('No se recibió la URL de la sesión de pago desde la API.');
            }
        } catch (err: any) {
            console.error("Purchase initiation failed:", err);
            setError(err.message || 'Ocurrió un error inesperado al intentar procesar tu pago.');
            setLoadingPackageId(null); // Reset loading state on error
        }
        // Do not reset loadingPackageId on success, as the page will redirect
    };

    // --- Check if Stripe IDs are missing for all packages (configuration error) ---
    const allLinksMissing = packages.every(pkg => pkg.stripePriceId === null);
    // Only show this critical error in production environments
    const showGeneralError = allLinksMissing && process.env.NODE_ENV === 'production';

    // --- Render Configuration Error Message (if needed) ---
    if (showGeneralError) {
        return (
            <div className={cn("w-full py-10 text-center", className)}>
                 <h3 className="text-2xl font-bold text-red-600 mb-3">Error de Configuración</h3>
                 <p className="text-gray-700">Las opciones de compra no están disponibles temporalmente.</p>
                 <p className="text-sm text-gray-500 mt-1">Por favor, contacta con el soporte técnico.</p>
            </div>
         );
     }

    // --- Main Component Render ---
    return (
        // Grid Container - No Framer Motion animations
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch", className)}>

            {/* Display Purchase-Specific Error Message */}
            {error && (
                 <div className="md:col-span-3 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center">
                     <p><strong>Error:</strong> {error}</p>
                 </div>
             )}

            {/* Map through each pricing package */}
            {packages.map((option) => {
                const isLoading = loadingPackageId === option.id; // Is this card's purchase loading?
                // Disable purchase button if loading OR if user is logged in but no Stripe ID exists
                const isPurchaseDisabled = isLoading || (!option.stripePriceId && !!user);

                // --- Determine Button Text ---
                const creditsMatch = option.priceDescription.match(/\/ (\d+)\s*(?:Crédito|Credito|Créditos|Creditos)/i);
                const creditsCount = creditsMatch ? parseInt(creditsMatch[1], 10) : null;
                let buttonText = option.buttonTextBase; // Start with base text ("Seleccionar")
                if (user && creditsCount !== null) {
                    // Logged-in user: "Comprar X Créditos" (Use "Comprar" if base is "Seleccionar")
                    const buyText = option.buttonTextBase === "Seleccionar" ? "Comprar" : option.buttonTextBase;
                    buttonText = `${buyText} ${creditsCount} Crédito${creditsCount !== 1 ? 's' : ''}`;
                } else if (!user) {
                    // Visitor: "Seleccionar [Plan Name]"
                    const planName = option.title.split(' ').slice(1).join(' '); // Extract name after "Paquete"
                    buttonText = `${option.buttonTextBase} ${planName || option.title}`; // Fallback to full title
                }


                // --- Button Style Definitions (Matching Original PricingSection) ---
                const commonButtonClasses = `w-full group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-lg tracking-wide rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-[#4C66FE]`;
                const featuredButtonClasses_Original = `text-white bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97]`;
                const normalButtonClasses_Original = `text-[#2539B0] bg-white border-2 border-[#4C66FE] hover:bg-blue-50 active:scale-[0.97] active:bg-blue-100`;
                const loadingClasses = 'opacity-50 cursor-wait';
                const disabledClasses = cn(
                    'opacity-50 cursor-not-allowed',
                    !option.featured && 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-400 hover:border-gray-300 active:scale-100 active:bg-gray-100', // Specific disabled style for normal button
                    option.featured && 'active:scale-100 hover:from-[#4C66FE] hover:to-[#2539B0] hover:shadow-md' // Prevent style changes on disabled featured button
                );

                // --- Render Individual Pricing Card ---
                return (
                    <div
                      key={option.id}
                      // Apply conditional styling based on 'featured' status (matching original)
                      className={cn(`relative flex flex-col rounded-2xl transition-all duration-300 ease-out`, // Base styles
                        option.featured
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-[#4C66FE] shadow-xl scale-[1.02] md:scale-105 z-10' // Featured card style
                          : 'bg-white border border-gray-200 shadow-lg overflow-hidden', // Normal card style
                        isPurchaseDisabled && !isLoading ? 'opacity-80' : '' // Slightly dim if disabled but not loading
                      )}
                    >
                        {/* "Más Popular" Badge */}
                        {option.featured && (
                           <div className="absolute top-0 right-5 -mt-3 z-20">
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold
                                             bg-gradient-to-r from-[#4C66FE] to-[#2539B0] text-white shadow-md">
                                  Más Popular
                              </span>
                           </div>
                        )}

                        {/* Card Content */}
                        <div className="flex flex-col flex-grow p-6 lg:p-8 pt-8">

                            {/* Title */}
                            <h3 className={cn('text-xl font-semibold mb-1', option.featured ? 'text-[#2539B0]' : 'text-gray-800')}>
                              {option.title}
                            </h3>

                            {/* Subtitle (No min-height) */}
                            <p className={cn('text-sm mb-4', // Removed min-h
                                option.featured ? 'text-[#3A4DC1]/90' : 'text-gray-600'
                            )}>
                                {option.subtitle}
                            </p>

                            {/* Price Block */}
                            <div className="flex items-baseline mb-6">
                                {/* Monetary Price (from Stripe) */}
                                <span className={cn('text-4xl lg:text-5xl font-bold',
                                    option.featured ? 'text-[#3A4DC1]' : 'text-gray-900' // Original featured color
                                )}>
                                    {option.monetaryPrice ?? <span className="text-gray-400 text-3xl italic">N/D</span>}
                                </span>
                                {/* Price Suffix (e.g., "/ 4 fotos") - Using the correct field */}
                                {option.monetaryPrice && option.priceSuffix && (
                                    <span className={cn('ml-2 text-xl',
                                        option.featured ? 'text-[#3A4DC1]/80' : 'text-gray-700' // Original featured color with opacity
                                    )}>
                                        {option.priceSuffix}
                                    </span>
                                )}
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 text-sm flex-grow mb-8">
                                {option.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start space-x-3">
                                        <Check className="w-5 h-5 flex-shrink-0 text-[#4C66FE] mt-0.5" />
                                        {/* Text color matches original featured logic */}
                                        <span className={cn(option.featured ? 'text-[#3A4DC1]' : 'text-gray-700')}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Action Button (Conditional: Login or Purchase) */}
                            <div className="mt-auto"> {/* Pushes button to the bottom */}
                                {user ? (
                                    // --- Purchase Button (User Logged In) ---
                                    <Button
                                        size="lg"
                                        disabled={isPurchaseDisabled}
                                        className={cn(
                                            commonButtonClasses,
                                            option.featured ? featuredButtonClasses_Original : normalButtonClasses_Original, // Apply original styles
                                            isLoading && loadingClasses, // Apply loading styles if needed
                                            isPurchaseDisabled && !isLoading && disabledClasses // Apply disabled styles if needed
                                        )}
                                        onClick={() => handlePurchase(option.stripePriceId, option.id)}
                                        aria-live="polite" // Announce loading state changes
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Procesando...</>
                                        ) : (
                                            buttonText // Display calculated button text
                                        )}
                                    </Button>
                                ) : (
                                    // --- Login/Select Button (Visitor) ---
                                    <Button
                                        asChild // Allows Link to control navigation
                                        size="lg"
                                        className={cn(
                                            commonButtonClasses,
                                            option.featured ? featuredButtonClasses_Original : normalButtonClasses_Original // Apply original styles
                                        )}
                                    >
                                        <Link href="/login" className="flex items-center justify-center w-full h-full">
                                            {buttonText} {/* Display calculated button text */}
                                        </Link>
                                    </Button>
                                )}
                                {/* Optional: Message if purchase is unavailable for a logged-in user */}
                                {!option.stripePriceId && user && !isLoading && (
                                    <p className="text-xs text-red-500 text-center mt-2" aria-hidden="true">Opción no disponible.</p>
                                )}
                            </div> {/* End Button Container */}
                        </div> {/* End Card Content */}
                    </div> // End Card Container
                ); // End return inside map
            })} {/* End packages.map */}
        </div> // End Grid Container
    ); // End Main Return
} // End PricingCards Component