"use client";

import React, { useEffect, useState, useCallback, memo } from "react"; // Importar useCallback y memo
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { Plus, Layers, ArrowRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { modelRowWithSamples } from "@/types/utils";
// Asumimos que ModelsTable puede ser pesado, lo importaremos para memoizarlo (si es posible)
import ModelsTable from "../ModelsTable";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export const revalidate = 0;

type ClientSideModelsListProps = {
  serverModels: modelRowWithSamples[] | [];
};

// --- Variantes de Animación (Sin cambios, generalmente no son el cuello de botella principal) ---
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
};

const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // Expo Out
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
};

const emptyStateChildVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
};


// --- Optimización: Memoizar ModelsTable ---
// Si ModelsTable es un componente funcional puro y solo depende de `models`,
// `React.memo` evitará que se vuelva a renderizar si la prop `models` no ha cambiado *referencialmente*.
// Nota: Esto es más efectivo si la referencia del array `models` no cambia innecesariamente.
const MemoizedModelsTable = memo(ModelsTable);

// --- Componente Principal Optimizado ---
export default function ClientSideModelsList({
  serverModels,
}: ClientSideModelsListProps) {

  // --- Estado y Cliente Supabase (Sin cambios) ---
  const [models, setModels] = useState<modelRowWithSamples[]>(serverModels);
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  // --- Optimización: useCallback para la función de actualización del estado ---
  // Esto asegura que la función `handleRealtimeUpdate` tenga una referencia estable
  // si alguna vez la necesitamos pasar como dependencia a otros hooks (aunque no es el caso aquí, es buena práctica).
  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    // console.log("Realtime Payload:", payload); // Descomentar para depurar

    let updatedModelsList = models; // Empezamos con la lista actual

    try {
      switch (payload.eventType) { // Corregido: Supabase usa eventType
        case 'INSERT': {
          // Intenta obtener samples solo si no vienen en el payload y el ID existe
          let samplesData = payload.new?.samples || [];
          if (payload.new?.id && !payload.new.samples) {
              // console.log(`Fetching samples for new model ${payload.new.id}`); // Debug
              const samples = await supabase
                .from("samples")
                .select("*")
                .eq("modelId", payload.new.id);
              samplesData = samples.data || [];
          }
          const newModel: modelRowWithSamples = { ...payload.new, samples: samplesData };
          // Añadir solo si no existe ya (previene duplicados por posibles ecos de realtime)
          if (!models.some(m => m.id === newModel.id)) {
             updatedModelsList = [...models, newModel];
          }
          break;
        }

        case 'UPDATE': {
          let samplesData = payload.new?.samples || [];
           // **Optimización clave**: Solo buscar samples si NO vienen en el payload Y el modelo existe.
           // Podrías incluso decidir NO volver a buscar samples en un UPDATE si ya los tenías,
           // a menos que una lógica específica requiera actualizarlos.
          const existingModelIndex = models.findIndex(m => m.id === payload.new?.id);
          if (existingModelIndex !== -1 && payload.new?.id && !payload.new.samples) {
               // console.log(`Fetching samples for updated model ${payload.new.id}`); // Debug
               // Reutiliza los samples existentes si es posible, o refetchea si es necesario
               // samplesData = models[existingModelIndex].samples; // Opción 1: Reutilizar
               const samples = await supabase // Opción 2: Refetchear (como estaba antes)
                 .from("samples")
                 .select("*")
                 .eq("modelId", payload.new.id);
               samplesData = samples.data || models[existingModelIndex].samples; // Fallback a los existentes si fetch falla
          } else if (existingModelIndex !== -1) {
            // Si los samples vienen en el payload o no necesitamos buscarlos
            samplesData = payload.new?.samples || models[existingModelIndex].samples;
          }

          const updatedModel: modelRowWithSamples = { ...payload.new, samples: samplesData };
          updatedModelsList = models.map(model =>
            model.id === updatedModel.id ? updatedModel : model
          );
          break;
        }

        case 'DELETE':
          if (payload.old?.id) {
            updatedModelsList = models.filter(model => model.id !== payload.old.id);
          }
          break;

        default:
          // Evento no manejado
          break;
      }
      if (updatedModelsList !== models) { // Comprobación de referencia (puede no ser suficiente si el contenido cambia pero la ref no)

          setModels(updatedModelsList); // Actualizar estado
      }

    } catch (error) {
        console.error("Error handling realtime update:", error);
        // Considera mostrar un mensaje al usuario si falla la actualización
    }

  // Usamos `models` como dependencia porque la lógica interna depende del estado actual
  // para evitar duplicados (en INSERT) o para mapear/filtrar (en UPDATE/DELETE).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, models]); // <- Dependencia de 'models' es necesaria aquí por la lógica interna


  useEffect(() => {
    // --- Suscripción a Supabase ---
    const channel = supabase
      .channel("realtime-models")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "models" },
        // Pasamos la función memoizada o definida con useCallback
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe((status, err) => {
         if (err) {
            console.error("Supabase channel subscription error:", err);
         }
         // console.log("Supabase channel status:", status);
      });

    // --- Cleanup ---
    return () => {
      supabase.removeChannel(channel).catch(err => {
         console.error("Error removing Supabase channel:", err);
      });
    };
  // Pasamos handleRealtimeUpdate como dependencia. Gracias a useCallback,
  // esta referencia solo cambiará si `supabase` o `models` cambian.
  }, [supabase, handleRealtimeUpdate]);

  // --- Renderizado ---
  const hasModels = models && models.length > 0;

  return (
    <div id="train-model-container" className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {hasModels ? (
        <motion.div
          className="flex flex-col gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Cabecera */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-between items-center"
            variants={itemVariants}
          >
             {/* Título */}
             <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Tus Modelos Entrenados
              </h1>
            </div>
            {/* Botón con Link */}
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"} className="w-full sm:w-fit shrink-0">
               {/* --- BOTÓN CON ESTILO ACTUALIZADO --- */}
               <Button
                 size={"lg"}
                 className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-lg tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md transition-all duration-300 ease-out hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97] active:shadow-[0_0_8px_4px_rgba(76,102,254,0.2)] active:from-[#4C66FE] active:to-[#2539B0]"
               >
                {/* Icono Plus con su animación específica */}
                <Plus className="mr-2 h-5 w-5 transition-transform duration-300 ease-out group-hover:rotate-90"/>
                Entrenar Nuevo Modelo
              </Button>
              {/* --- FIN BOTÓN CON ESTILO ACTUALIZADO --- */}
            </Link>
          </motion.div>

          {/* Tabla Memoizada */}
          <motion.div variants={itemVariants}>
             {/* Usar el componente memoizado */}
             <MemoizedModelsTable models={models} />
          </motion.div>
        </motion.div>

      ) : (
         // Estado Vacío (sin cambios lógicos)
        <motion.div
          className="flex flex-col items-center text-center gap-6 py-16 md:py-24 px-6 rounded-xl bg-gradient-to-br from-white to-[#F0F5FF]/60 border border-[#CED5FE]/50 shadow-sm max-w-3xl mx-auto"
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
        >
           <motion.div className="p-3 rounded-full bg-[#E0E7FF]" variants={emptyStateChildVariants}>
            <Layers size={32} className="text-[#2539B0]" />
          </motion.div>
          <motion.h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900" variants={emptyStateChildVariants}>
            Empieza tu primera creación
          </motion.h2>
          <motion.p className="text-base text-gray-600 max-w-md" variants={emptyStateChildVariants}>
            Parece que aún no has entrenado ningún modelo. ¡Es hora de dar vida a tus ideas con IA!
          </motion.p>
          <motion.div variants={emptyStateChildVariants} className="mt-4">
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"}>
               {/* --- BOTÓN CON ESTILO ACTUALIZADO (Estado Vacío) --- */}
               <Button
                 size={"lg"}
                 className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-lg tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-md transition-all duration-300 ease-out hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.97] active:shadow-[0_0_8px_4px_rgba(76,102,254,0.2)] active:from-[#4C66FE] active:to-[#2539B0]"
               >
                Entrenar Modelo Ahora
                {/* Icono ArrowRight con su animación específica */}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Button>
              {/* --- FIN BOTÓN CON ESTILO ACTUALIZADO --- */}
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}