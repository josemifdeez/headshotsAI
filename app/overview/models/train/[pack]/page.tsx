// app/(main)/(routes)/tune/[pack]/page.tsx (o la ruta correspondiente)

import TrainModelZoneHybrid from "@/components/TrainModelZone"; // Asegúrate que la ruta es correcta
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export default async function TunePackPage({ params }: { params: { pack: string } }) {
  const backUrl = packsIsEnabled ? "/overview/packs" : "/overview";
  const sideColumnWidth = "md:w-24"; // Mantenemos el ancho

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 lg:gap-x-8 items-start">

            {/* --- Columna 1: Botón (Izquierda) --- */}
            <div className={`w-full md:w-auto mb-6 md:mb-0 flex md:justify-end ${sideColumnWidth}`}>
                 <Link href={backUrl} className="inline-block">
                    <Button
                      variant="secondary" // Mantenemos el variant base
                      size="sm"
                      className="
                        text-gray-600 dark:text-gray-400      /* Texto un poco más suave */
                        hover:bg-gray-200/80 dark:hover:bg-gray-700/80 /* Hover refinado */
                        hover:text-gray-700 dark:hover:text-gray-300 /* Texto en hover (opcional, ajustar si es necesario) */
                        transition-all duration-150 ease-in-out /* Transición suave */
                        px-3                                   /* Asegurar padding */
                      "
                    >
                      {/* Icono también un poco más suave */}
                      <LuArrowLeft className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      Volver
                    </Button>
                  </Link>
            </div>

            {/* --- Columna 2: Contenido Principal (Centro) --- */}
            <div className="w-full">
                <TrainModelZoneHybrid packSlug={params.pack} />
            </div>

            {/* --- Columna 3: Espaciador (Derecha) --- */}
            <div className={`hidden md:block ${sideColumnWidth}`}>
                 
            </div>

        </div> {/* Fin del Layout Grid */}
    </div> // Fin del Contenedor General de Página
  );
}