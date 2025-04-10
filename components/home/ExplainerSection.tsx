'use client';

import React from "react";
import { motion } from "framer-motion";
import { FiUploadCloud, FiCpu, FiImage } from 'react-icons/fi';

// --- Datos de los Pasos (sin cambios) ---
const stepsData = [
    {
        stepNumber: 1,
        title: "Carga tus Imágenes",
        description: "Selecciona al menos 4 selfies de buena calidad. Asegúrate de que se vea bien tu rostro, mirando al frente y sin accesorios que lo cubran.",
        imageSrc: "/example.png",
        altText: "Ejemplo de foto subida por usuario",
        icon: FiUploadCloud,
    },
    {
        stepNumber: 2,
        title: "Procesamiento IA",
        description: "Nuestra inteligencia artificial analizará tus rasgos faciales. Este proceso suele completarse en unos 20 minutos. Recibirás una notificación por email.",
        imageSrc: "/blur.png",
        altText: "Visualización del proceso de la IA",
        icon: FiCpu,
    },
    {
        stepNumber: 3,
        title: "Obtén Resultados",
        description: "Una vez finalizado el entrenamiento, generaremos un conjunto de imágenes únicas basadas en tus fotos, listas para descargar y utilizar.",
        imageSrc: "/result.png",
        altText: "Ejemplo de resultado generado por IA",
        icon: FiImage,
    },
];

// --- Variantes de Animación (sin cambios) ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

export default function ExplainerSection() {
    return (
        <div
            id="como-funciona"
            className="w-full max-w-7xl mx-auto mt-20 md:mt-28 px-8 sm:px-12 lg:px-16 py-16 md:py-20"
        >
            {/* --- Título (sin cambios) --- */}
            <motion.div
                className="mb-16 md:mb-20 text-center"
                 initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                    Cómo funciona
                </h2>
                {/* La barra usa tus colores de marca, lo cual es coherente */}
                <div className="mt-4 h-1.5 w-24 mx-auto bg-gradient-to-r from-[#4C66FE] to-[#2539B0] rounded-full"></div>
            </motion.div>

            {/* --- Contenedor de Pasos --- */}
            <motion.div
                className="relative flex flex-col gap-20 md:gap-28"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {stepsData.map((step, index) => {
                    const Icon = step.icon;
                    const isOdd = index % 2 !== 0;

                    return (
                        <motion.div
                            key={step.stepNumber}
                            className={`relative flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full ${isOdd ? 'md:flex-row-reverse' : ''}`}
                            variants={itemVariants}
                        >
                             {/* --- Número de Fondo Lateral (AZUL CLARO DE MARCA, OPACIDAD AJUSTADA) --- */}
                             <div
                                className={`
                                    absolute inset-y-0 z-0 pointer-events-none user-select-none
                                    hidden md:flex items-center {/* <-- OCULTO EN MÓVIL, VISIBLE DESDE MD */}
                                    w-auto
                                    ${isOdd ? 'left-full ml-4 md:ml-6 justify-start' : 'right-full mr-4 md:mr-6 justify-end'}
                                `}
                                aria-hidden="true"
                            >
                                <span className={`
                                    font-sans {/* <-- Fuente Sans por defecto */}
                                    text-7xl md:text-8xl lg:text-9xl font-black text-[#CED5FE] {/* <-- CAMBIO: Azul claro de marca */}
                                    opacity-60 {/* <-- CAMBIO: Opacidad ajustada */}
                                    leading-none whitespace-nowrap
                                `}>
                                    {step.stepNumber}
                                </span>
                            </div>

                            {/* Columna de Texto */}
                            <div className="relative z-10 flex-1 w-full">
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="relative flex-shrink-0">
                                        {/* --- FONDO DEL ICONO (GRADIENTE AZUL ACTUALIZADO) --- */}
                                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-[#CED5FE] shadow-md"> {/* <-- CAMBIO: Gradiente a azul claro de marca */}
                                            {/* --- ICONO (AZUL OSCURO DE MARCA) --- */}
                                            <Icon className="w-6 h-6 text-[#2539B0]" /> {/* <-- CAMBIO: Azul oscuro de marca */}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">{step.title}</h3>
                                        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna de Imagen (sin cambios aquí) */}
                            <div className="relative z-10 flex-1 w-full mt-8 md:mt-0 flex justify-center">
                                {/* Glow effect usa tus colores, lo cual es bueno */}
                                <div
                                    className="absolute inset-[-15px] md:inset-[-20px] rounded-full opacity-60 blur-xl animate-pulse-slow pointer-events-none"
                                    style={{
                                        backgroundImage: `radial-gradient(circle, rgba(76, 102, 254, 0.4), rgba(37, 57, 176, 0.2), transparent 70%)` /* Usa #4C66FE y #2539B0 */
                                    }}
                                    aria-hidden="true"
                                />
                                {/* Imagen */}
                                <motion.img
                                    src={step.imageSrc}
                                    alt={step.altText}
                                    width={500}
                                    height={350}
                                    className="relative z-10 rounded-xl object-cover w-full max-w-lg h-auto shadow-xl transform transition-transform duration-300 ease-out"
                                    whileHover={{
                                        scale: 1.04,
                                        boxShadow: '0 20px 40px -10px rgba(76, 102, 254, 0.3)' /* Sombra usa #4C66FE */
                                    }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    onError={(e) => {
                                         console.error("Error loading image:", step.imageSrc);
                                         e.currentTarget.style.display = 'none';
                                     }}
                                />
                            </div>
                        </motion.div> // --- Fin Contenedor de Paso ---
                    );
                })}
            </motion.div>
        </div>
    );
}