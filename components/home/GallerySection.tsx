'use client'; // Necesario para Framer Motion y el componente de slider

import React from 'react';
import { motion } from 'framer-motion';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

// --- Datos de Ejemplo ---
// Asegúrate de que las rutas a tus imágenes sean correctas
const examplesData = [
    { id: 1, beforeSrc: '/examples/example1.png', afterSrc: '/examples/result1.png', altText: 'Comparación 1' },
    { id: 2, beforeSrc: '/examples/example2.png', afterSrc: '/examples/result2.png', altText: 'Comparación 2' },
    { id: 3, beforeSrc: '/examples/example3.png', afterSrc: '/examples/result3.png', altText: 'Comparación 3' },
];

// --- Variantes de Animación ---
// (Asegúrate de que estén definidas o impórtalas si las usas externamente)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1 // Ejemplo de stagger
        }
    }
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
     }
};

// --- Estilos del Slider ---
const sliderStyles = {
    handle: {
        border: '2px solid white',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
        // El tamaño se define con clases de Tailwind en el elemento
    },
    divider: {
        backgroundColor: '#4C66FE', // Azul principal
        width: '3px',
        boxShadow: '0px 0px 5px rgba(76, 102, 254, 0.5)', // Sombra azul
    }
};

export default function ExamplesGallerySection() {
    return (
        <div id="ejemplos" className="w-full max-w-7xl mx-auto mt-20 md:mt-28 px-8 sm:px-12 lg:px-16 py-16 md:py-20">
            {/* --- Título y Subtítulo --- */}
            <motion.div
                className="mb-16 md:mb-20 text-center"
                 initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                    Resultados Reales
                </h2>
                <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    Mira cómo transformamos selfies normales en fotos de perfil profesionales listas para destacar.
                </p>
                <div className="mt-6 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
            </motion.div>

            {/* --- Galería de Ejemplos --- */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {examplesData.map((example) => (
                    <motion.div
                        key={example.id}
                        // El contenedor de la tarjeta ya tiene relative, lo que es bueno.
                        className="relative group bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.03]"
                        variants={itemVariants}
                    >
                        <ReactCompareSlider
                            handle={
                                <div
                                    style={sliderStyles.handle}
                                    className="w-11 h-11 bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full flex items-center justify-center cursor-ew-resize"
                                >
                                     {/* Icono del handle */}
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5 transform rotate-90">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                     </svg>
                                </div>
                            }
                            itemOne={
                                // Contenedor para itemOne: relative, overflow-hidden y z-0
                                <div className="relative w-full h-full overflow-hidden z-0">
                                    <ReactCompareSliderImage
                                        src={example.beforeSrc}
                                        alt={`Antes - ${example.altText}`}
                                        className="block w-full h-full object-cover" // block es importante
                                    />
                                    {/* Badge "Antes": absolute, sin z-index explícito aquí */}
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <span className="inline-block px-3 py-1.5 rounded-full bg-[#CED5FE] text-[#2539B0] text-xs font-semibold shadow-md"> {/* Estilos ajustados como en la imagen */}
                                            Antes
                                        </span>
                                    </div>
                                </div>
                            }
                            itemTwo={
                                // Contenedor para itemTwo: relative, overflow-hidden y z-10
                                <div className="relative w-full h-full overflow-hidden z-10">
                                    <ReactCompareSliderImage
                                        src={example.afterSrc}
                                        alt={`Después - ${example.altText}`}
                                        className="block w-full h-full object-cover" // block es importante
                                    />
                                    {/* Badge "Después": absolute y z-10 para asegurar que está sobre su propia imagen si hay solapamiento interno */}
                                     <div className="absolute top-3 right-3 z-10 pointer-events-none">
                                         <span className="inline-block px-3 py-1.5 rounded-full bg-[#2539B0] text-white text-xs font-semibold shadow-md"> {/* Estilos ajustados como en la imagen */}
                                             Después
                                         </span>
                                     </div>
                                </div>
                            }
                            style={{
                                // Estilos en línea para el slider
                                width: '100%',
                                height: 'auto', // O una altura fija si la necesitas
                                aspectRatio: '1 / 1', // Mantiene la proporción cuadrada
                                '--divider-color': sliderStyles.divider.backgroundColor,
                                '--divider-width': sliderStyles.divider.width,
                                // Aplicamos el redondeo directamente al slider
                                // Usamos calc() por si el border-gray-200 (1px) afecta visualmente
                                borderRadius: 'calc(1rem - 1px)', // Coincide con rounded-2xl (1rem) del padre
                                overflow: 'hidden', // ¡Crucial! El slider debe recortar su contenido
                            } as React.CSSProperties}
                            // No se necesita className="w-full" aquí si ya está en style
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}