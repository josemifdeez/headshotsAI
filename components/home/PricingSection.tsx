// src/components/PricingSection.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

// --- Datos de los Planes (Sin cambios) ---
const pricingOptions = [
  {
    id: "starter",
    title: "Starter",
    price: "1 Crédito",
    priceSuffix: "/ 4 fotos",
    description:
      "Perfecto para probar y obtener tus primeras fotos profesionales.",
    features: [
      "4 Fotos únicas generadas por IA",
      "Entrega en ~20 minutos",
      "Ideal para una actualización rápida",
    ],
    buttonText: "Empezar",
    featured: false,
  },
  {
    id: "basic",
    title: "Basic",
    price: "3 Créditos",
    priceSuffix: "/ 12 fotos",
    description:
      "Ideal para profesionales que necesitan variedad para diferentes perfiles.",
    features: [
      "12 Fotos únicas generadas por IA",
      "Entrega en ~20 minutos",
      "Soporte por email prioritario",
      "Más opciones para elegir",
    ],
    buttonText: "Elegir Basic",
    featured: true,
  },
  {
    id: "premium",
    title: "Premium",
    price: "5 Créditos",
    priceSuffix: "/ 20 fotos",
    description: "El mejor valor para una presencia online impecable y versátil.",
    features: [
      "20 Fotos únicas generadas por IA",
      "Entrega en ~20 minutos",
      "Soporte por email prioritario",
      "Máxima variedad y calidad",
       "Acceso a estilos beta (próximamente)",
    ],
    buttonText: "Elegir Premium",
    featured: false,
  },
];

// --- Variantes de Animación (Sin cambios) ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
    hover: {
        scale: 1.03,
        boxShadow: "0 15px 30px -10px rgba(76, 102, 254, 0.2)",
        transition: { duration: 0.2 }
    }
};


export default function PricingSection() {
  return (
    // REMOVED: bg-gradient-to-b from-white to-blue-50/30
    <div id="precios" className="w-full py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* --- Título de la Sección --- */}
        <motion.div
          className="mb-16 md:mb-20 text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Planes a tu medida
          </h2>
          {/* REMOVED: Subtitle <p> tag */}
          <div className="mt-6 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
        </motion.div>

        {/* --- Contenedor de Tarjetas --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {pricingOptions.map((option) => (
            <motion.div
              key={option.id}
              // AJUSTE: Se quitó overflow-hidden si es 'featured' para que el badge no se corte
              // Se mantiene overflow-hidden en las normales por si acaso, aunque podría quitarse de todas.
              className={`
                relative flex flex-col rounded-2xl shadow-lg
                transition-all duration-300 ease-out
                ${option.featured
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-[#4C66FE] shadow-xl scale-[1.02] md:scale-105 z-10' // Sin overflow-hidden aquí
                  : 'bg-white border border-gray-200 hover:shadow-md overflow-hidden' // Mantenemos overflow-hidden aquí por si acaso
                }
              `}
              variants={itemVariants}
              whileHover="hover"
            >
              {/* --- Badge "Más Popular" --- */}
              {option.featured && (
                 // AJUSTE: Posicionamiento ligeramente ajustado (menos negativo en mt) para asegurar visibilidad
                 <div className="absolute top-0 right-5 -mt-3 z-20"> {/* Ajustado mt y right/mr */}
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold
                                   bg-gradient-to-r from-[#4C66FE] to-[#2539B0] text-white shadow-md">
                        Más Popular
                    </span>
                 </div>
              )}

              {/* --- Contenido de la Tarjeta (Sin cambios internos) --- */}
              <div className="flex flex-col flex-grow p-6 lg:p-8 space-y-5">

                <div className="text-center">
                  <h3 className={`text-2xl font-semibold ${option.featured ? 'text-[#2539B0]' : 'text-gray-800'}`}>
                    {option.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 h-12">
                    {option.description}
                  </p>
                </div>

                <div className="text-center my-4">
                  <span className="text-4xl lg:text-5xl font-bold text-gray-900">{option.price}</span>
                  {option.priceSuffix && <span className="text-base text-gray-500 ml-1">{option.priceSuffix}</span>}
                </div>

                <ul className="space-y-3 text-sm flex-grow">
                  {option.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start space-x-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${option.featured ? 'text-[#4C66FE]' : 'text-green-500'}`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                   <Button
                      asChild
                      size="lg"
                      className={`w-full group relative inline-flex items-center justify-center px-8 py-3
                                 font-semibold text-lg tracking-wide rounded-full
                                 transition-all duration-300 ease-out
                                 ${option.featured
                                   ? 'text-white bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97]'
                                   : 'text-[#2539B0] bg-white border-2 border-[#4C66FE] hover:bg-blue-50 active:scale-[0.97] active:bg-blue-100'
                                  }`}
                    >
                      <Link href="/login" className="flex items-center justify-center gap-2">
                        {option.buttonText}
                      </Link>
                    </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}