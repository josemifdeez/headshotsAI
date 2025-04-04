"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

import { Icons } from "@/components/icons";
import { Database } from "@/types/supabase";
import { imageRow, modelRow, sampleRow } from "@/types/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge"; // Keep Badge import if used internally

// Variantes de animación (sin cambios)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

type ClientSideModelProps = {
  serverModel: modelRow;
  serverImages: imageRow[];
  samples: sampleRow[];
};

export default function ClientSideModel({
  serverModel,
  serverImages,
  samples,
}: ClientSideModelProps) {
  // Lógica de Supabase y estado (sin cambios funcionales)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  const [model, setModel] = useState<modelRow>(serverModel);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-model-${model.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "models",
          filter: `id=eq.${model.id}`,
        },
        (payload: { new: modelRow }) => {
          console.log("Realtime update received:", payload.new);
          if (payload.new.id === model.id) {
             setModel(payload.new);
          }
        }
      )
      .subscribe((status) => {
         console.log(`Supabase channel status: ${status}`);
      });

    return () => {
      console.log(`Removing channel for model ${model.id}`);
      supabase.removeChannel(channel);
    };
  }, [supabase, model.id]); // Dependencia simplificada

  // Determinar el estado para la UI interna
  const isLoading = model.status === 'processing' || model.status === 'starting';
  const isFinished = model.status === 'finished';
  const hasFailed = model.status === 'failed';

  return (
    // Contenedor principal con ancho completo
    <div className="w-full">
      {/* Contenedor del contenido (dos columnas en pantallas grandes) */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

        {/* --- Columna 1: Datos de Entrenamiento --- */}
        {samples && samples.length > 0 && (
          <motion.div
            className="flex w-full lg:w-1/2 flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Título con color de texto de theme */}
            <h2 className="text-2xl font-semibold text-foreground/80 flex items-center gap-2">
              <Icons.upload className="w-5 h-5 text-primary" /> {/* Icono usando color primario */}
              Datos de Entrenamiento
            </h2>
            {/* Grid de imágenes de muestra */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              {samples.map((sample) => (
                <motion.div
                  key={sample.id}
                  className="relative group"
                  variants={itemVariants}
                >
                  {/* Usando bg-muted y border-border del theme */}
                  <AspectRatio ratio={1 / 1} className="bg-muted rounded-lg overflow-hidden border border-border shadow-sm">
                    <img
                      src={sample.uri}
                      alt={`Training sample ${sample.id}`}
                      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                      loading="lazy"
                    />
                  </AspectRatio>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* --- Columna 2: Resultados (o estados intermedios) --- */}
        <div className="flex flex-col w-full lg:w-1/2 gap-4">
          {/* Título usando color de theme */}
          <h2 className="text-2xl font-semibold text-foreground/80 flex items-center gap-2">
            <Icons.sparkles className="w-5 h-5 text-primary" /> {/* Icono usando color primario */}
            Resultados del Modelo
          </h2>

          {/* El Badge principal está en la página, aquí mostramos contenido basado en estado */}
          {isFinished ? (
            // --- Resultados Finalizados ---
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
               initial="hidden"
               animate="visible"
               variants={containerVariants}
            >
              {serverImages && serverImages.length > 0 ? (
                serverImages.map((image) => (
                  <motion.div
                    key={image.id}
                    className="relative group cursor-pointer"
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {/* Imagen de resultado: bg-muted, hover con border-primary */}
                    <AspectRatio
                        ratio={1 / 1}
                        className="bg-muted rounded-lg overflow-hidden border border-transparent shadow-md group-hover:shadow-xl group-hover:border-primary transition-all duration-300 ease-out"
                     >
                      <img
                        src={image.uri}
                        alt={`Generated result ${image.id}`}
                        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                      />
                      {/* Overlay opcional */}
                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity duration-300 ease-out opacity-0 group-hover:opacity-100">
                          <Icons.download className="w-6 h-6 text-white opacity-80" />
                       </div>
                    </AspectRatio>
                  </motion.div>
                ))
              ) : (
                // Caso sin imágenes (usando colores de theme)
                <div className="col-span-full text-center py-8 px-4 bg-muted rounded-lg border border-border">
                    <Icons.imageOff className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-foreground font-medium">El entrenamiento finalizó, pero no se generaron imágenes.</p>
                    <p className="text-sm text-muted-foreground mt-1">Por favor, contacta con soporte si crees que esto es un error.</p>
                </div>
              )}
            </motion.div>
          ) : isLoading ? (
             // --- Estado de Carga/Procesando (usando border-accent) ---
            <motion.div
              className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 border border-accent rounded-lg text-center min-h-[250px]" // Usado border-accent
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Icons.cpu className="w-12 h-12 text-primary mb-4 animate-pulse" /> {/* Usado text-primary */}
              <p className="text-lg font-semibold text-primary">Procesando tus imágenes...</p> {/* Usado text-primary */}
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Nuestra IA está trabajando. Esto suele tardar unos 20 minutos. Te avisaremos por email cuando esté listo.
              </p>
              {/* Barra de progreso usando colores primarios */}
              <div className="w-full bg-primary/20 rounded-full h-1.5 mt-6 overflow-hidden">
                 <div className="bg-primary h-1.5 rounded-full animate-progress indeterminate-progress"></div>
              </div>
               {/* CSS para la animación de progreso (si no está global) */}
              <style jsx>{`
                @keyframes progress-indeterminate {
                  0% { transform: translateX(-100%) scaleX(0.1); }
                  50% { transform: translateX(0%) scaleX(0.6); }
                  100% { transform: translateX(100%) scaleX(0.1); }
                }
                .indeterminate-progress {
                  animation: progress-indeterminate 2s infinite ease-in-out;
                  transform-origin: 0% 50%;
                }
              `}</style>
            </motion.div>
          ) : hasFailed ? (
             // --- Estado de Fallo (usando colores destructive) ---
             <motion.div
              className="flex flex-col items-center justify-center p-8 bg-destructive/10 border border-destructive/30 rounded-lg text-center min-h-[250px]" // Usando bg/border destructivos (baja opacidad)
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
               <Icons.alertTriangle className="w-10 h-10 text-destructive mb-4" /> {/* Usado text-destructive */}
               <p className="text-lg font-semibold text-destructive-foreground">¡Ups! Algo salió mal</p> {/* Usado destructive-foreground */}
               <p className="text-sm text-muted-foreground mt-1">
                  El entrenamiento del modelo no pudo completarse.
               </p>
            </motion.div>
          ) : (
             // --- Estado inicial o desconocido ---
             <div className="flex flex-col items-center justify-center p-8 bg-muted border border-border rounded-lg text-center min-h-[250px]">
               <Icons.hourglass className="w-10 h-10 text-muted-foreground mb-4" />
               <p className="text-lg font-medium text-foreground/80">Esperando inicio del entrenamiento...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}