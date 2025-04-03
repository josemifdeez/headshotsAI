"use client";

import React, { useCallback, memo } from "react"; // Importar memo y useCallback
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiCpu, FiCheckCircle, FiXCircle, FiClock, FiArrowRight, FiUser } from 'react-icons/fi';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Icons } from "./icons"; // Asumiendo que Icons se usa en alguna parte o es un remanente
import { Database } from "@/types/supabase";
import { modelRowWithSamples } from "@/types/utils";
import { cn } from "@/lib/utils";

// --- Tipos ---
type ModelsGridProps = {
  models: modelRowWithSamples[];
};

type ModelCardProps = {
  model: modelRowWithSamples;
  statusInfo: StatusInfoType; // Usar el tipo definido abajo
  onCardClick: (id: number) => void; // Callback para el click
};

type StatusInfoType = { // Definir un tipo para la info de estado
    icon: React.ElementType;
    classes: string;
    text: string;
};

// --- Variantes de Animación (sin cambios) ---
const containerVariants = { /* ... */ };
const itemVariants = { /* ... */ };

// --- Helper para Icono y Estilo de Estado (Optimización: Movido fuera del componente) ---
const getStatusInfo = (status: string): StatusInfoType => {
    // Asegurarse de manejar null/undefined status si es posible
    const lowerStatus = status?.toLowerCase() || 'unknown';
    switch (lowerStatus) {
      case "finished":
        return { icon: FiCheckCircle, classes: "text-emerald-600 bg-emerald-50 border-emerald-200", text: "Completado" };
      case "processing":
        return { icon: FiCpu, classes: "text-[#4C66FE] bg-[#E0E7FF]/60 border-[#C7D2FE]/80", text: "Entrenando" };
      case "failed":
        return { icon: FiXCircle, classes: "text-red-600 bg-red-50 border-red-200", text: "Fallido" };
      default: // Incluye 'unknown' o cualquier otro estado
        return { icon: FiClock, classes: "text-gray-500 bg-gray-100 border-gray-200", text: status || "Desconocido" }; // Mostrar el estado original o "Desconocido"
    }
};

// --- Componente Optimizado: ModelCard (Memoizado) ---
const ModelCard = memo(({ model, statusInfo, onCardClick }: ModelCardProps) => {
  // console.log(`Rendering ModelCard: ${model.id}`); // Descomentar para depurar re-renders

  return (
    <motion.div
      key={model.id} // key sigue siendo necesario aquí para AnimatePresence/React
      layout // Mantenemos layout para animaciones fluidas
      variants={itemVariants}
      // initial, animate, exit ahora son manejados por AnimatePresence y variants
      whileHover="hover"
      onClick={() => onCardClick(model.id)}
      className="group relative bg-white rounded-lg border border-gray-200/90 shadow-sm overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg hover:border-gray-300"
    >
      {/* Indicador de Hover */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-[#4C66FE]"
        initial={{ scaleX: 0 }}
        variants={{ hover: { scaleX: 1 } }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ originX: 0 }}
      />

      <div className="p-4 flex flex-col h-full">
        {/* Fila Superior: Nombre y Estado Badge */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-[15px] text-[#1E2A78] truncate pr-2 group-hover:text-[#2539B0] transition-colors" title={model.name || `Modelo ${model.id}`}>
            {model.name || `Modelo ${model.id}`}
          </h3>
          <div
              className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
                  statusInfo.classes
              )}
          >
            <statusInfo.icon className={cn("h-3 w-3", model.status === 'processing' ? 'animate-spin-slow' : '')} />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        {/* Fila Media: Tipo */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <FiUser className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          Género: <span className="ml-1 font-medium text-gray-700 truncate">{model.type}</span>
        </div>

        {/* Fila Inferior: Avatares y Flecha Hover */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
          {/* Avatares */}
          {model.samples && model.samples.length > 0 ? (
            <div className="flex items-center">
              <div className="flex -space-x-2 overflow-hidden mr-2">
                {model.samples.slice(0, 3).map((sample) => (
                  <Avatar key={sample.id} className="h-7 w-7 border-2 border-white shadow-sm">
                    {/* Optimización: Añadir loading="lazy" */}
                    <AvatarImage
                        src={sample.uri}
                        className="object-cover"
                        alt={`Muestra ${sample.id}`}
                        loading="lazy"
                    />
                    <AvatarFallback className="bg-gray-200 text-[9px] font-medium">?</AvatarFallback>
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

          {/* Flecha Indicadora */}
          <motion.div
              className="text-gray-400 group-hover:text-[#4C66FE] transition-colors"
              initial={{ x: 0, opacity: 0 }}
              variants={{ hover: { x: 2, opacity: 1 } }}
              transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <FiArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
// Añadir displayName para facilitar la depuración en React DevTools
ModelCard.displayName = 'ModelCard';


// --- Componente Principal Optimizado: ModelsGrid (Memoizado) ---
const ModelsGrid = memo(({ models }: ModelsGridProps) => {
  const router = useRouter();

  // Optimización: Usar useCallback para estabilizar la referencia de la función
  const handleRedirect = useCallback((id: number) => {
    router.push(`/overview/models/${id}`);
  }, [router]); // Dependencia: router

  // console.log("Rendering ModelsGrid"); // Descomentar para depurar re-renders

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mensaje si no hay modelos */}
      {!models || models.length === 0 && (
         <motion.div
             className="col-span-full text-center py-16 px-6 bg-white border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
         >
            <FiUser className="w-10 h-10 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No hay modelos aún</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Empieza entrenando tu primer modelo para visualizarlo aquí.
            </p>
         </motion.div>
      )}

      {/* Mapeo de Modelos Usando el Componente Memoizado ModelCard */}
      {/* AnimatePresence maneja las animaciones de entrada/salida */}
      <AnimatePresence initial={false}>
          {models?.map((model) => {
            // Optimización: Calcular statusInfo aquí, fuera de ModelCard
            const statusInfo = getStatusInfo(model.status);
            return (
              // Pasamos el key a ModelCard también, aunque AnimatePresence lo usa externamente
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
// Añadir displayName para facilitar la depuración
ModelsGrid.displayName = 'ModelsGrid';

export default ModelsGrid; // Exportar el componente memoizado
