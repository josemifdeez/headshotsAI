// src/app/page.tsx

'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { ArrowRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import ExplainerSectionModern from "@/components/ExplainerSection";
import PricingSection from "@/components/PricingSection";
import HeroImageTransition from "@/components/HeroImageTransition";

// Variantes de animación
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setUser(null);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  if (user) return null;

  return (
    <div className="flex flex-col pt-6 md:pt-12">
      <motion.div
        className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-6 md:px-8 py-6 md:py-10 max-w-7xl w-full mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Sección de Texto --- */}
        <motion.div
          className="flex flex-col space-y-4 lg:space-y-5 lg:w-1/2 w-full text-center lg:text-left items-center lg:items-start"
          variants={itemVariants}
        >
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

            {/* --- BOTÓN REDISEÑADO v3.1: Forma Píldora + Glow Sutil + Animación Horizontal --- */}
            <Button
              asChild
              size="lg"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3
                         font-semibold text-lg tracking-wide text-white
                         rounded-full // Forma de píldora
                         bg-gradient-to-r from-[#4C66FE] to-[#2539B0] // Gradiente base
                         shadow-md
                         transition-all duration-300 ease-out

                         // --- Efectos Hover ---
                         hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] // Glow suave
                         hover:from-[#5C76FF] hover:to-[#3A4CC0] // Cambio de gradiente

                         // --- Efecto Active (Click) ---
                         active:scale-[0.97]
                         active:shadow-[0_0_8px_4px_rgba(76,102,254,0.2)] // Glow reducido
                         active:from-[#4C66FE] active:to-[#2539B0]
                        "
            >
              <Link href="/login" className="flex items-center justify-center sm:justify-start gap-2">
                Consigue YA tus fotos
                {/* Icono con animación - CORRECCIÓN DEFINITIVA: Sin rotación, solo traslación horizontal */}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out
                                       group-hover:translate-x-1.5" // <-- CAMBIO: Eliminada la clase rotate, aumentado translate-x
                />
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

        </motion.div>

        {/* --- Sección de Imagen --- */}
        <motion.div
          className="lg:w-1/2 w-full mt-8 lg:mt-0 flex justify-center"
          variants={itemVariants}
        >
           <HeroImageTransition />
        </motion.div>
      </motion.div>

      {/* --- Secciones inferiores --- */}
      <ExplainerSectionModern />
      <PricingSection />
    </div>
  );
}