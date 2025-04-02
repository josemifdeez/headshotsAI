// src/components/HeroImageTransition.tsx
'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuración (Sin cambios) ---
const NUM_IMAGES = 3;
const CYCLE_DURATION_MS = 8000;
const ANIMATION_DURATION_S = 1.0;
const VISIBLE_DURATION_EACH_S = (CYCLE_DURATION_MS / 1000 - 2 * ANIMATION_DURATION_S) / 2;
if (VISIBLE_DURATION_EACH_S < 0.5) {
    console.warn(`HeroImageTransition: Visible time per image (${VISIBLE_DURATION_EACH_S}s) is very short.`);
}
const VISIBLE_DURATION_MS = Math.max(500, VISIBLE_DURATION_EACH_S * 1000);
const ANIMATION_DURATION_MS = ANIMATION_DURATION_S * 1000;
const PLACEHOLDER_SIZE = '400x500';
const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 500;

// --- Tipos (Sin cambios) ---
interface ImagePair {
    original: string;
    ai: string;
}

// --- Pares de Imágenes (Sin cambios) ---
const allImagePairs: ImagePair[] = [
    { original: '/images/example1.png', ai: '/images/result1.png' },
    { original: '/images/example2.png', ai: '/images/result2.png' },
    { original: '/images/example3.png', ai: '/images/result3.png' },
];
const imagePairs = allImagePairs.slice(0, NUM_IMAGES);
// --- Fin Configuración ---


// --- Variantes de Animación para Clip Path (Sin cambios) ---
const clipPathVariants = {
    enter: {
        clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
        transition: { duration: ANIMATION_DURATION_S, ease: [0.65, 0, 0.35, 1] }
    },
    exit: {
        clipPath: `polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)`,
        transition: { duration: ANIMATION_DURATION_S, ease: [0.65, 0, 0.35, 1] }
    },
};

// --- Variantes para la Barra Mágica (Con Keyframes de Opacidad) ---

// Definimos los keyframes de opacidad que queremos para ambas transiciones
// (Fade in rápido -> Mantener -> Fade out rápido)
const opacityKeyframes = [0, 1, 1, 0];
// Definimos los puntos de tiempo (0% a 100%) donde ocurren los keyframes de opacidad
// Fade in completo al 5%, se mantiene hasta el 95%, fade out completo al 100%
const opacityTimes = [0, 0.05, 0.95, 1];

const magicBarVariants = {
    // Estado inicial absoluto (siempre fuera y opacidad 0)
    // 'initial' no necesita keyframes, solo el punto de partida
    initial: {
        left: "101%", // Empieza fuera a la DERECHA
        opacity: 0,
    },
    // Estado durante la animación de ENTRADA (Derecha -> Izquierda)
    animate: {
        left: "-1%", // Termina fuera a la IZQUIERDA
        opacity: opacityKeyframes, // Usa los keyframes definidos
        // La transición controlará CÓMO se interpola entre initial y animate
    },
    // Estado durante la animación de SALIDA (Izquierda -> Derecha)
    exit: {
        left: "101%", // Termina fuera a la DERECHA
        opacity: opacityKeyframes, // Usa los MISMOS keyframes para el fade de salida
        // La transición controlará CÓMO se interpola entre animate y exit
    }
};


// --- Componente ImageSlot (Aplicando Transición con 'times' para opacidad) ---
interface ImageSlotProps {
    pair: ImagePair;
    showAi: boolean;
    index: number;
}

const ImageSlot = memo(({ pair, showAi, index }: ImageSlotProps) => {
    const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>, type: 'Original' | 'AI') => {
        const target = event.currentTarget;
        const errorText = `Error+${type}+${index + 1}`;
        const fallbackBg = type === 'Original' ? 'CED5FE/4C66FE' : '2539B0/CED5FE';
        if (target) {
            target.src = `https://placehold.co/${PLACEHOLDER_SIZE}/${fallbackBg}?text=${errorText}&font=roboto`;
            target.style.visibility = 'visible';
            target.onerror = null;
        }
    }, [index]);

    const isFirstSlot = index === 0;

    // --- Transición DETALLADA para la Barra Mágica ---
    const magicBarTransition = {
        // Configuración para la propiedad 'left' (movimiento)
        left: {
            duration: ANIMATION_DURATION_S, // Usa la duración principal
            ease: [0.65, 0, 0.35, 1]      // Usa el easing principal
        },
        // Configuración ESPECÍFICA para la propiedad 'opacity' (keyframes)
        opacity: {
            duration: ANIMATION_DURATION_S, // La animación de opacidad dura lo mismo
            ease: "linear", // Usamos linear para que los 'times' controlen la curva
            times: opacityTimes // Aplica los puntos de tiempo definidos
        }
    };

    // Definición del color base y gradiente para la barra
    const baseColor = '#4C66FE';
    const baseColorRGB = '76, 102, 254';
    const lightColorRGBA = `rgba(120, 140, 255, 0.9)`;
    const baseColorRGBA = `rgba(${baseColorRGB}, 1)`;
    const shadowColorRGBA = `rgba(${baseColorRGB}, 0.6)`;

    return (
        <div className="relative isolate rounded-lg overflow-hidden shadow-lg aspect-[4/5] bg-gray-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50">
            {/* Imagen Original (Base) */}
            <motion.img
                key={`original-${index}`}
                src={pair.original}
                alt={`Original ${index + 1}`}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                loading={isFirstSlot ? "eager" : "lazy"}
                fetchPriority={isFirstSlot ? 'high' : 'auto'}
                className="absolute inset-0 w-full h-full object-cover z-10"
                style={{ willChange: 'opacity' }}
                onError={(e) => handleImageError(e, 'Original')}
            />

            {/* AnimatePresence para la Imagen AI y la Barra Mágica */}
            <AnimatePresence initial={false}>
                {showAi && (
                    <>
                        {/* Imagen AI (Animada con clip-path) */}
                        <motion.img
                            key={`ai-${index}`}
                            src={pair.ai}
                            alt={`AI Result ${index + 1}`}
                            width={IMAGE_WIDTH}
                            height={IMAGE_HEIGHT}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover z-20"
                            style={{ willChange: 'clip-path' }}
                            initial="exit"
                            animate="enter"
                            exit="exit"
                            variants={clipPathVariants} // Usa variantes de clip-path (con su propia transition interna)
                            onError={(e) => handleImageError(e, 'AI')}
                        />

                        {/* Barra Mágica Vertical (Animando 'left' y opacidad con keyframes) */}
                        <motion.div
                            key={`magic-bar-${index}`}
                            className="absolute inset-y-0 w-1.5 md:w-2 z-30 pointer-events-none"
                            style={{
                                background: `linear-gradient(to bottom, ${lightColorRGBA}, ${baseColorRGBA}, ${lightColorRGBA})`,
                                filter: 'blur(0.5px)',
                                boxShadow: `0 0 10px 3px ${shadowColorRGBA}`,
                                willChange: 'left, opacity, filter',
                            }}
                            variants={magicBarVariants} // Usa variantes con keyframes de opacidad
                            initial="initial"          // Estado inicial (opacity: 0)
                            animate="animate"          // Anima 'left' y 'opacity' keyframes
                            exit="exit"                // Anima 'left' y 'opacity' keyframes
                            transition={magicBarTransition} // <<-- APLICA LA TRANSICIÓN DETALLADA AQUÍ
                            aria-hidden="true"
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.showAi === nextProps.showAi &&
           prevProps.pair.original === nextProps.pair.original &&
           prevProps.pair.ai === nextProps.pair.ai;
});
ImageSlot.displayName = 'ImageSlot';


// --- Componente Principal HeroImageTransition (Sin cambios necesarios aquí) ---
const HeroImageTransition = () => {
    const [showAi, setShowAi] = useState<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const scheduleToggle = (delay: number) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setShowAi(prevShowAi => {
                    const nextShowAi = !prevShowAi;
                    const nextDelay = VISIBLE_DURATION_MS + ANIMATION_DURATION_MS;
                    scheduleToggle(nextDelay);
                    return nextShowAi;
                });
            }, delay);
        };
        scheduleToggle(VISIBLE_DURATION_MS);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    return (
        <div
            className="grid gap-4 md:gap-6 lg:gap-8 w-full"
            style={{ gridTemplateColumns: `repeat(${NUM_IMAGES}, 1fr)` }}
        >
            {imagePairs.map((pair, index) => (
                <div key={index} className="relative group">
                     <div
                        className="absolute inset-[-20px] rounded-xl opacity-60 group-hover:opacity-80 blur-2xl transition-opacity duration-500 pointer-events-none z-0 animate-pulse-slow"
                        style={{
                            backgroundImage: `radial-gradient(circle, rgba(76, 102, 254, 0.45), rgba(37, 57, 176, 0.25), transparent 75%)`
                        }}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 transform group-hover:scale-[1.02] transition-transform duration-400 ease-out">
                        <ImageSlot
                            pair={pair}
                            showAi={showAi}
                            index={index}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HeroImageTransition;