"use client";

import React, { useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiClock, FiArrowRight, FiUser } from 'react-icons/fi';
import { Icons } from "./icons"; // NECESARIO: Asegúrate que ./icons exporta un componente 'spinner'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Database } from "@/types/supabase"; // Ajusta la ruta si es necesario
import { modelRowWithSamples } from "@/types/utils"; // Ajusta la ruta si es necesario
import { cn } from "@/lib/utils"; // Ajusta la ruta si es necesario

// --- Tipos ---
type ModelsGridProps = {
  models: modelRowWithSamples[];
};

type ModelCardProps = {
  model: modelRowWithSamples;
  statusInfo: StatusInfoType;
  onCardClick: (id: number) => void;
};

type StatusInfoType = {
    icon: React.ElementType;
    classes: string;
    text: string;
};

// --- Variantes de Animación (Contenedor y Items) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
        when: "afterChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    }
  },
  exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
  },
  hover: {
    // Parent hover state, triggers child 'hover' variants
  }
};


// --- Helper para Icono y Estilo de Estado ---
const getStatusInfo = (status: string | null | undefined): StatusInfoType => {
    const lowerStatus = status?.toLowerCase() || 'unknown';
    switch (lowerStatus) {
      case "finished":
        return { icon: FiCheckCircle, classes: "text-emerald-600 bg-emerald-50 border-emerald-200", text: "Completado" };
      case "processing":
        return { icon: Icons.spinner, classes: "text-[#4C66FE] bg-[#E0E7FF]/60 border-[#C7D2FE]/80", text: "Entrenando" };
      case "failed":
        return { icon: FiXCircle, classes: "text-red-600 bg-red-50 border-red-200", text: "Fallido" };
      default:
        return { icon: FiClock, classes: "text-gray-500 bg-gray-100 border-gray-200", text: status || "Desconocido" };
    }
};

// --- Helper para traducir Género (NUEVO) ---
const getSpanishGender = (type: string | null | undefined): string => {
    const lowerType = type?.toLowerCase(); // Convertir a minúsculas para comparación segura

    switch (lowerType) {
        case 'man': // <-- AJUSTA ESTO al valor exacto en tu DB
            return 'Hombre';
        case 'woman': // <-- AJUSTA ESTO al valor exacto en tu DB
            return 'Mujer';
        // Añade más casos si es necesario
        default:
            return 'N/A'; // O 'Desconocido' si prefieres
    }
};


// --- Componente Optimizado: ModelCard (Flecha oculta por defecto, aparece en hover, Género en Español) ---
const ModelCard = memo(({ model, statusInfo, onCardClick }: ModelCardProps) => {

  return (
    <motion.div
      key={model.id}
      layout
      variants={itemVariants}
      whileHover="hover"
      onClick={() => onCardClick(model.id)}
      className="group relative bg-white rounded-lg border border-gray-200/90 shadow-sm overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg hover:border-gray-300"
    >
      {/* Línea Azul Superior con Animación de Loop Lateral en Hover */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-[#4C66FE]"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        variants={{
            hover: {
                x: ["-100%", "100%"],
                transition: {
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 1.5,
                        ease: "linear"
                    }
                }
            }
        }}
      />

      {/* Card Content Area */}
      <div className="p-4 flex flex-col h-full">

        {/* Fila Superior: Nombre y Estado Badge */}
        <div className="flex justify-between items-center mb-3">
           <h3
            className="font-semibold text-[15px] text-[#1E2A78] truncate pr-2 group-hover:text-[#2539B0] transition-colors"
            title={model.name || `Modelo ${model.id}`}
          >
            {model.name || `Modelo ${model.id}`}
          </h3>
           <div
              className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
                  statusInfo.classes
              )}
          >
            <statusInfo.icon className={cn(
                "h-3 w-3 flex-shrink-0",
                model.status === 'processing' ? 'animate-spin' : ''
            )} />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Fila Media: Tipo/Género (AHORA USA getSpanishGender) */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <FiUser className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          Género: <span className="ml-1 font-medium text-gray-700 truncate">{getSpanishGender(model.type)}</span> {/* <-- CAMBIADO */}
        </div>

        {/* Fila Inferior: Avatares y Flecha Hover */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
          {/* Avatares de Muestras */}
          {model.samples && model.samples.length > 0 ? (
            <div className="flex items-center">
              <div className="flex -space-x-2 overflow-hidden mr-2">
                {model.samples.slice(0, 3).map((sample) => (
                  <Avatar key={sample.id} className="h-7 w-7 border-2 border-white shadow-sm">
                    <AvatarImage
                        src={sample.uri}
                        className="object-cover"
                        alt={`Muestra ${sample.id}`}
                        loading="lazy"
                    />
                    <AvatarFallback className="bg-gray-200 text-[9px] font-medium text-gray-500">?</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {model.samples.length > 3 && (
                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5 border border-gray-200">
                  +{model.samples.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic h-7 flex items-center">Sin muestras</div>
          )}

          {/* Flecha Indicadora (oculta por defecto con opacity-0, aparece en hover) */}
          <motion.div
              className="opacity-0 group-hover:text-[#4C66FE] transition-colors"
              initial={{ opacity: 0, x: 0 }}
              variants={{
                  hover: {
                      opacity: 1,
                      x: 3
                  }
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <FiArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
ModelCard.displayName = 'ModelCard';


// --- Componente Principal Optimizado: ModelsGrid (Sin cambios aquí) ---
const ModelsGrid = memo(({ models }: ModelsGridProps) => {
  const router = useRouter();

  const handleRedirect = useCallback((id: number) => {
    router.push(`/overview/models/${id}`);
  }, [router]);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Mensaje si no hay modelos */}
      {!models || models.length === 0 && (
         <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="col-span-full text-center py-16 px-6 bg-white border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center min-h-[200px]"
         >
            <FiUser className="w-10 h-10 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No hay modelos aún</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Empieza entrenando tu primer modelo para visualizarlo aquí.
            </p>
         </motion.div>
      )}

      {/* Mapeo de Modelos con Animaciones de Entrada/Salida */}
      <AnimatePresence initial={false}>
          {models?.map((model) => {
            const statusInfo = getStatusInfo(model.status);
            // No necesitamos pasar getSpanishGender como prop, se llama dentro de ModelCard
            return (
              <ModelCard
                key={model.id}
                model={model}
                statusInfo={statusInfo}
                onCardClick={handleRedirect}
              />
            );
          })}
        </AnimatePresence>
    </motion.div>
  );
});
ModelsGrid.displayName = 'ModelsGrid';

export default ModelsGrid;