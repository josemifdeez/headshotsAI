// components/GetCreditsClientPart.tsx (O la ruta donde lo tengas)
'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

// --- INTERFAZ CORREGIDA ---
// monetaryPrice ahora es string | null para coincidir con page.tsx
interface PackageWithPriceId {
  id: string;
  title: string;
  price: string; // Texto de créditos
  priceSuffix?: string;
  monetaryPrice: string | null; // <-- CORREGIDO: Acepta string o null
  description: string;
  features: string[];
  buttonText: string;
  featured: boolean;
  stripePriceId: string | null; // ID de precio de Stripe
}

interface GetCreditsClientPartProps {
  user: User | null;
  packagesWithPriceIds: PackageWithPriceId[]; // Ahora espera el tipo correcto
}

export function GetCreditsClientPart({ user, packagesWithPriceIds }: GetCreditsClientPartProps) {
    const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- La lógica de handlePurchase se mantiene igual ---
    const handlePurchase = async (priceId: string | null, packageId: string) => {
        if (!priceId) {
        setError(`Error: Configuración de pago incompleta para ${packageId}.`);
        console.error(`Stripe Price ID is missing for package ${packageId}`);
        return;
        }
        setLoadingPackageId(packageId);
        setError(null);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ priceId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No se pudo iniciar la sesión de pago.');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No se recibió la URL de la sesión de pago.');
            }
        } catch (err: any) {
            console.error("Purchase initiation failed:", err);
            setError(err.message || 'Ocurrió un error inesperado al intentar comprar.');
            setLoadingPackageId(null);
        }
    };

    return (
        <>
            {/* Mensaje de Error Global */}
            {error && ( <div className="mb-8 max-w-xl mx-auto p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center"> <p><strong>Error:</strong> {error}</p> </div> )}

            {/* Contenedor de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
                {packagesWithPriceIds.map((option) => {
                    const isLoading = loadingPackageId === option.id;
                    const isPurchaseDisabled = isLoading || !option.stripePriceId;

                    return (
                        <div key={option.id} className={` relative flex flex-col rounded-2xl shadow-lg transition-all duration-300 ease-out ${option.featured ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-[#4C66FE] shadow-xl scale-[1.02] md:scale-105 z-10' : 'bg-white border border-gray-200 hover:shadow-md'} ${isPurchaseDisabled && !isLoading ? 'opacity-70' : ''} `} >
                            {/* Badge "Más Popular" */}
                            {option.featured && ( <div className="absolute top-0 right-5 -mt-3 z-20"> <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-[#4C66FE] to-[#2539B0] text-white shadow-md"> Más Popular </span> </div> )}

                            {/* Contenido de la Tarjeta */}
                            <div className="flex flex-col flex-grow p-6 lg:p-8 space-y-5">
                                <div className="text-center"> <h3 className={`text-2xl font-semibold ${option.featured ? 'text-[#2539B0]' : 'text-gray-800'}`}> {option.title} </h3> <p className="mt-2 text-sm text-gray-600 h-12"> {option.description} </p> </div>

                                {/* =============================================== */}
                                {/* ===== SECCIÓN DE PRECIO (maneja null)    ===== */}
                                {/* =============================================== */}
                                <div className="text-center my-4">
                                    {/* Muestra el PRECIO MONETARIO o 'N/D' si es null */}
                                    <p className="text-4xl lg:text-5xl font-bold text-gray-900">
                                        {option.monetaryPrice !== null ? option.monetaryPrice : 'N/D'}
                                    </p>
                                    {/* Muestra la cantidad de créditos */}
                                    <span className="text-base text-gray-600 block mt-1">
                                        {option.price}
                                        {/* Muestra el sufijo si existe */}
                                        {option.priceSuffix && (
                                            <span className="text-gray-500 ml-1">{option.priceSuffix}</span>
                                        )}
                                    </span>
                                </div>
                                {/* =============================================== */}
                                {/* ============ FIN SECCIÓN DE PRECIO ============ */}
                                {/* =============================================== */}

                                <ul className="space-y-3 text-sm flex-grow">
                                    {option.features.map((feature, fIndex) => ( <li key={fIndex} className="flex items-start space-x-3"> <Check className={`w-5 h-5 flex-shrink-0 ${option.featured ? 'text-[#4C66FE]' : 'text-green-500'}`} /> <span className="text-gray-700">{feature}</span> </li> ))}
                                </ul>

                                {/* Botón de Compra */}
                                <div className="mt-auto pt-6">
                                    <Button size="lg" disabled={isPurchaseDisabled} className={`w-full group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-lg tracking-wide rounded-full transition-all duration-300 ease-out ${option.featured ? 'text-white bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97]' : 'text-[#2539B0] bg-white border-2 border-[#4C66FE] hover:bg-blue-50 active:scale-[0.97] active:bg-blue-100'} ${isLoading ? 'opacity-50 cursor-wait' : ''} ${isPurchaseDisabled && !isLoading ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-100' : ''} `} onClick={() => handlePurchase(option.stripePriceId, option.id)} >
                                        {isLoading ? 'Procesando...' : option.buttonText}
                                    </Button>
                                    {!option.stripePriceId && !isLoading && ( <p className="text-xs text-red-500 text-center mt-2">Opción no disponible.</p> )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}