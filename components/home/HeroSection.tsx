import Link from "next/link";
import Image from 'next/image';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import HeroImageTransition from "@/components/home/HeroImageTransition";

const linkedInProfiles = [
  "https://www.linkedin.com/in/usuariodeejemplo1/",
  "https://www.linkedin.com/in/usuariodeejemplo2/",
  "https://www.linkedin.com/in/usuariodeejemplo3/",
];

export default function HeroSection() {
  return (
    <section
      className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-16 max-w-7xl w-full mx-auto px-4 md:px-6 py-10 md:py-16"
    >
      {/* Contenido Izquierda (Texto, CTA) - lg:w-[45%] */}
      <div className="flex flex-col lg:w-[45%] w-full text-center lg:text-left items-center lg:items-start">
        {/* Social Proof (Animado) - Estilo Minimalista */}
        {/* Cambios:
            - Fondo interno vuelve a ser claro: bg-blue-100.
            - Texto con color más suave: text-slate-700.
            - Borde giratorio se mantiene con colores claros/medios.
            - Se eliminan bordes/anillos blancos de avatares.
        */}
        <span className="relative inline-flex overflow-hidden rounded-full p-[1px] mb-5 flex-shrink-0">
          <span
            className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#CED5FE_0%,#4C66FE_50%,#CED5FE_100%)]" // Borde claro/medio mantenido
            style={{ zIndex: 0 }}
          ></span>
          <div
            // Fondo claro y padding original
            className="relative inline-flex items-center justify-center w-full gap-2.5 rounded-full bg-blue-100 px-3 py-1.5" // Fondo azul muy pálido
            style={{ zIndex: 10 }}
          >
            {/* Contenedor de Avatares con superposición */}
            <div className="flex flex-shrink-0 -space-x-2">
              {linkedInProfiles.map((url, index) => (
                <Link
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Anillo de foco vuelve al azul principal
                  className={`relative block rounded-full transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#4C66FE] z-${30 - index * 10}`}
                  aria-label={`Perfil de LinkedIn Cliente ${index + 1}`}
                >
                  <Image
                    src={`/images/avatars/avatar${index + 1}.jpg`}
                    alt={`Cliente satisfecho ${index + 1}`}
                    width={24}
                    height={24}
                    // Sin borde adicional
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </Link>
              ))}
            </div>
            {/* Texto gris oscuro suave */}
            <span className="text-sm font-semibold text-slate-600">
              +100 clientes satisfechos
            </span>
          </div>
        </span>

        {/* Headline */}
        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tighter lg:tracking-tight leading-none text-gray-900 mb-4">
          Fotos
          <span className="lg:hidden"><br /></span>
          <span className="hidden lg:inline"> </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C66FE] to-[#2539B0]">
            profesionales
          </span>
          <br />
          con IA, en minutos.
        </h1>

        {/* Subtítulo */}
        <p className="text-base md:text-lg text-gray-700 max-w-xl mb-6">
           Transforma tus selfies en retratos profesionales desde casa. Nuestra IA genera imágenes de alta calidad perfectas para LinkedIn, CVs y portfolios.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center lg:items-start space-y-4 w-full sm:w-auto lg:mt-2">
          <Button asChild size="lg" className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-lg font-semibold tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-lg transition-all duration-300 ease-out hover:shadow-[0_0_25px_8px_rgba(76,102,254,0.3)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.98] active:shadow-[0_0_12px_6px_rgba(76,102,254,0.25)]">
            <Link href="/login" className="flex items-center justify-center sm:justify-start gap-2.5">
              Consigue YA tus fotos
              <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </Link>
          </Button>
          <div className="text-sm text-center lg:text-left text-gray-500 pt-1 space-y-1">
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link className="font-medium text-[#2539B0] hover:text-[#4C66FE] hover:underline" href="/login">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Derecha (Imagen) */}
      <div className="lg:w-[55%] w-full mt-8 lg:mt-16 flex justify-center lg:justify-end items-center lg:items-start px-4 lg:px-0">
         <div className="relative w-full">
             <div className="relative w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
                 <HeroImageTransition />
             </div>
         </div>
      </div>
    </section>
  );
}