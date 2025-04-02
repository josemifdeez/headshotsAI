// src/app/ejemplos/page.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
// Necesitamos: ArrowRight, Sparkles
import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from "@/components/ui/button";
// import Image from "next/image"; // Descomentar si usas Next/Image

// --- METADATOS ---
/* (Assume metadata exists if needed)
export const metadata = {
  title: 'Ejemplos de Transformación IA | Foto Pro IA',
  description: 'Mira ejemplos reales del antes y después de fotos transformadas con nuestra IA. De fotos casuales a retratos profesionales.',
  // ... other tags
};
*/

// --- DATOS ---
const placeholderSize = '200x250';
const casosDeExito = [
   {
    id: 'andres',
    nombre: 'Andrés Gómez',
    titulo: 'Desarrollador de Software',
    linkedin: 'https://www.linkedin.com/in/ejemplo1',
    originales: [
      { id: 'ao1', src: `https://placehold.co/${placeholderSize}/D1D5DB/6B7280?text=Orig+1`, alt: 'Foto original 1 de Andrés Gómez' },
      { id: 'ao2', src: `https://placehold.co/${placeholderSize}/E5E7EB/4B5563?text=Orig+2`, alt: 'Foto original 2 de Andrés Gómez' },
      { id: 'ao3', src: `https://placehold.co/${placeholderSize}/F3F4F6/374151?text=Orig+3`, alt: 'Foto original 3 de Andrés Gómez' },
      { id: 'ao4', src: `https://placehold.co/${placeholderSize}/F9FAFB/1F2937?text=Orig+4`, alt: 'Foto original 4 de Andrés Gómez' },
    ],
    generadas: [
      { id: 'ag1', src: `https://placehold.co/${placeholderSize}/4C66FE/FFFFFF?text=IA+1&font=lato`, alt: 'Foto generada con IA 1 para Andrés Gómez' },
      { id: 'ag2', src: `https://placehold.co/${placeholderSize}/3A4CC0/FFFFFF?text=IA+2&font=lato`, alt: 'Foto generada con IA 2 para Andrés Gómez' },
      { id: 'ag3', src: `https://placehold.co/${placeholderSize}/5C76FF/FFFFFF?text=IA+3&font=lato`, alt: 'Foto generada con IA 3 para Andrés Gómez' },
      { id: 'ag4', src: `https://placehold.co/${placeholderSize}/2539B0/FFFFFF?text=IA+4&font=lato`, alt: 'Foto generada con IA 4 para Andrés Gómez' },
    ]
  },
   {
    id: 'sofia',
    nombre: 'Sofía Rivera',
    titulo: 'Diseñadora UX/UI',
    linkedin: 'https://www.linkedin.com/in/ejemplo2',
    originales: [
      { id: 'so1', src: `https://placehold.co/${placeholderSize}/D1D5DB/6B7280?text=Orig+1`, alt: 'Foto original 1 de Sofía Rivera' },
      { id: 'so2', src: `https://placehold.co/${placeholderSize}/E5E7EB/4B5563?text=Orig+2`, alt: 'Foto original 2 de Sofía Rivera' },
      { id: 'so3', src: `https://placehold.co/${placeholderSize}/F3F4F6/374151?text=Orig+3`, alt: 'Foto original 3 de Sofía Rivera' },
      { id: 'so4', src: `https://placehold.co/${placeholderSize}/F9FAFB/1F2937?text=Orig+4`, alt: 'Foto original 4 de Sofía Rivera' },
    ],
    generadas: [
       { id: 'sg1', src: `https://placehold.co/${placeholderSize}/4C66FE/FFFFFF?text=IA+1&font=lato`, alt: 'Foto generada con IA 1 para Sofía Rivera' },
      { id: 'sg2', src: `https://placehold.co/${placeholderSize}/3A4CC0/FFFFFF?text=IA+2&font=lato`, alt: 'Foto generada con IA 2 para Sofía Rivera' },
      { id: 'sg3', src: `https://placehold.co/${placeholderSize}/5C76FF/FFFFFF?text=IA+3&font=lato`, alt: 'Foto generada con IA 3 para Sofía Rivera' },
      { id: 'sg4', src: `https://placehold.co/${placeholderSize}/2539B0/FFFFFF?text=IA+4&font=lato`, alt: 'Foto generada con IA 4 para Sofía Rivera' },
    ]
  }
];
// --- FIN DATOS ---

// --- Variantes de Animación --- (Copied from your V5)
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, // Curva de ease suave
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }, // Stagger para elementos internos
  },
};

const imageGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }, // Stagger más rápido para imágenes
  },
}

const imageItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 15 } }, // Animación muelle
  hover: { scale: 1.06, z: 10, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)", transition: {duration: 0.2} }
};

const separatorVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.5, type: 'spring', stiffness: 100, damping: 12 } } // Aparece después
}
// --- FIN Variantes ---

// --- Componente "Tarjeta de Transformación" --- (Copied from your V5)
function TransformationCard({ caso }: { caso: typeof casosDeExito[0] }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col" // Card blanco con sombra XL
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {/* --- Cabecera --- */}
      <motion.div className="p-6 border-b border-gray-100" variants={contentVariants}>
        <div className="flex items-center gap-x-2 mb-1">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            {caso.nombre}
          </h2>
          {caso.linkedin && caso.linkedin !== '#' && (
            <Link href={caso.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:text-[#005999] transition-colors shrink-0" aria-label={`Perfil de LinkedIn de ${caso.nombre}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><title>Perfil de LinkedIn</title><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-500">{caso.titulo}</p>
      </motion.div>

      {/* --- Cuerpo de la Tarjeta --- */}
      <motion.div className="p-6 flex-grow" variants={contentVariants}>

        {/* Sección Fotos Originales */}
        <section className="mb-5">
          <h3 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">Antes</h3>
          <motion.div
            className="grid grid-cols-4 gap-2 md:gap-3"
            variants={imageGridVariants}
          >
            {caso.originales.map((img) => (
              <motion.div
                key={img.id}
                className="rounded-md overflow-hidden aspect-[4/5] relative bg-gray-100"
                variants={imageItemVariants} whileHover="hover"
              >
                <img src={img.src} alt={img.alt} width={200} height={250} loading="lazy" className="object-cover w-full h-full"/>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* --- SEPARADOR DE TRANSFORMACIÓN IA POTENTE --- */}
        <motion.div
          className="relative flex justify-center items-center my-4 md:my-6"
          variants={separatorVariants}
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
          <div className="relative p-1 bg-gradient-to-br from-[#4C66FE] to-[#2539B0] rounded-full shadow-lg">
             <div className="absolute -inset-1 bg-gradient-to-br from-[#4C66FE] to-[#2539B0] rounded-full blur-md opacity-60 animate-pulse"></div>
             <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white rounded-full">
               <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#2539B0]" />
             </div>
           </div>
        </motion.div>
        {/* --- FIN SEPARADOR --- */}

        {/* Sección Fotos Generadas con IA (con fondo azulado) */}
        <section className="mt-5 bg-[#F0F5FF]/50 p-4 rounded-lg border border-[#CED5FE]/50"> {/* <-- ESTA ES LA SECCIÓN AZULADA */}
          <h3 className="text-sm font-medium mb-3 text-[#2539B0] uppercase tracking-wider flex items-center gap-x-1.5">
              <Sparkles className="w-3.5 h-3.5 opacity-80"/>
              Después (IA)
          </h3>
          <motion.div
            className="grid grid-cols-4 gap-2 md:gap-3"
             variants={imageGridVariants}
          >
            {caso.generadas.map((img) => (
              <motion.div
                key={img.id}
                className="rounded-md overflow-hidden aspect-[4/5] relative bg-gray-800" // Mantiene fondo oscuro placeholder
                variants={imageItemVariants} whileHover="hover"
              >
                <img src={img.src} alt={img.alt} width={200} height={250} loading="lazy" className="object-cover w-full h-full"/>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </motion.div>
    </motion.div>
  );
}

// --- Componente Principal de la Página ---
export default function EjemplosPageCombined() { // Renombrado para claridad

  return (
    // Contenedor principal SIN fondo explícito (se elimina el bg-gradient)
    // Heredará el fondo del body/layout o será transparente.
    <div className="flex flex-col items-center pt-16 md:pt-24 pb-20 md:pb-28 w-full px-4 md:px-8">

      {/* --- Sección Hero (Sin cambios) --- */}
      <motion.div
        className="max-w-4xl w-full text-center mb-16 md:mb-20"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-gray-900">
          El Antes y <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C66FE] to-[#2539B0]">Después</span> con IA
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Comprueba la increíble transformación. De fotos casuales a retratos profesionales listos para impresionar, todo gracias a nuestra IA.
        </p>
        <div className="mt-8">
            <Button asChild size="lg" className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-lg tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md transition-all duration-300 ease-out hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97]">
              <Link href="/#precios" className="flex items-center justify-center gap-2">
                Transforma tus Fotos
                <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Link>
            </Button>
        </div>
      </motion.div>

      {/* --- GRID PARA LAS TARJETAS DE TRANSFORMACIÓN --- */}
      <div
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 px-4" // Gap entre tarjetas
      >
         {/* Usamos TransformationCard que tiene el estilo deseado */}
         {casosDeExito.map((caso) => (
           <TransformationCard key={caso.id} caso={caso} />
         ))}
      </div>

      {/* --- SECCIÓN CTA FINAL (Sin cambios) --- */}
      <motion.section
         className="w-full max-w-3xl text-center mt-20 md:mt-28 px-6" // Margen después de la grid
         initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}
       >
         <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
            ¿Listo para tu propia transformación?
         </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Únete a cientos de profesionales que ya usan fotos IA para destacar. Es rápido, asequible y los resultados hablan por sí solos.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
           <Button asChild size="lg" className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-lg tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md transition-all duration-300 ease-out hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97]">
              <Link href="/login" className="flex items-center justify-center gap-2">
                Empezar ahora
                <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1"/>
              </Link>
            </Button>
           <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-2 border-[#4C66FE] text-[#2539B0] hover:bg-[#CED5FE]/30 active:bg-[#CED5FE]/50 font-semibold text-lg px-8 py-3 transition-all active:scale-[0.97]">
             <Link href="/#precios">Ver Planes y Precios</Link>
           </Button>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <span>¿Ya tienes cuenta? </span>
          <Link className="font-medium text-[#2539B0] hover:text-[#4C66FE] hover:underline" href="/login">
            Iniciar Sesión
          </Link>
        </div>
      </motion.section>
    </div>
  );
}