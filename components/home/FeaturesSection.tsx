// src/components/home/KeyFeaturesSection.tsx
'use client'; // Necesario para Framer Motion

import React from 'react';
import { motion } from 'framer-motion';
// --- Importaciones de Iconos (Lucide) ---
import { CheckCircle, Zap, Palette, ThumbsUp, LucideProps } from 'lucide-react';

// --- Datos de las Características Clave (Sin cambios) ---
interface FeatureItem {
  icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
    {
    icon: CheckCircle,
    title: "Resultados de Estudio Profesional",
    description: "Perfeccionamos iluminación, enfoque y colorimetría para un acabado impecable.",
  },
  {
    icon: Zap,
    title: "Fotos Perfectas en Minutos",
    description: "Sube tus selfies, nuestra IA hace la magia. Resultados asombrosos sin esperas.",
  },
  {
    icon: Palette,
    title: "Tu Estilo, Tus Reglas",
    description: "Explora infinitos atuendos, fondos y ambientes. Define tu imagen profesional.",
  },
  {
    icon: ThumbsUp,
    title: "Increíblemente Fácil de Usar",
    description: "Diseñada para todos. Consigue fotos de nivel pro sin ser un experto técnico.",
  }
];
// --- FIN Datos Características ---

// --- Variantes de Animación (Sin cambios) ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.25,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeInOut", // Usamos una curva válida
        },
    },
};

const textHoverVariant = {
     hover: { x: 5, transition: { duration: 0.2 }}
}

// --- Componente Principal ---
export default function KeyFeaturesSection() {
  return (
    <section id="caracteristicas" className="w-full py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* --- Título de la Sección (Sin cambios) --- */}
        <motion.div
          className="mb-16 md:mb-20 text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Resultados Únicos
          </h2>
          <div className="mt-6 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
        </motion.div>

        {/* --- Contenedor Principal de Features (Grid) --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-12 gap-y-10 md:gap-y-12" // Ajustado gap ligeramente
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            // --- Contenedor de Cada Feature Item con NUEVO FONDO ---
            <motion.div
              key={index}
              className={`
                relative group flex gap-6 items-start // Layout base
                p-6                           // Padding aumentado ligeramente
                rounded-2xl                  // Bordes redondeados (podría ser -xl si prefieres como el ejemplo)
                // --- ESTILOS DE FONDO/BORDE/SOMBRA DEL EJEMPLO ---
                bg-gradient-to-br from-white to-[#F0F5FF]/60
                border border-[#CED5FE]/50
                shadow-sm
                // --- Transiciones y Hover sutil para la tarjeta en sí ---
                transition-all duration-300 ease-out
                hover:shadow-md              // Sombra un poco más marcada al pasar el ratón
                hover:border-[#CED5FE]/80    // Borde un poco más opaco al pasar el ratón
              `}
              variants={itemVariants}
              // whileHover (global para la tarjeta) no es necesario si usamos group-hover
            >
              {/* --- Icono y su Fondo Decorativo (Sin cambios respecto a versión anterior) --- */}
              <div className="flex-shrink-0 mt-1 relative">
                 <div className="absolute -inset-2.5 rounded-full bg-gradient-to-br from-[#CED5FE]/40 via-white to-[#CED5FE]/20 opacity-70 blur-lg transition-all duration-400 ease-out group-hover:opacity-100 group-hover:scale-110 group-hover:-inset-3"></div>
                 <div className={`
                    relative z-10
                    flex items-center justify-center w-14 h-14
                    rounded-2xl
                    bg-gradient-to-br from-[#4C66FE] to-[#2539B0]
                    text-white
                    shadow-lg group-hover:shadow-xl
                    transition-all duration-300 ease-out
                    group-hover:scale-[1.08]
                 `}>
                   <feature.icon className="w-7 h-7 transition-transform duration-300 group-hover:rotate-[-8deg]" />
                 </div>
              </div>

              {/* --- Contenedor del Texto (Animado al hover - Sin cambios) --- */}
              <motion.div
                  className="flex-grow pt-1"
                  variants={textHoverVariant}
                  whileHover="hover" // Este whileHover SÍ se queda, afecta sólo al texto
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-[#2539B0]">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div> // Fin Feature Item
          ))}
        </motion.div> {/* Fin Grid Features */}
      </div>
    </section>
  );
}