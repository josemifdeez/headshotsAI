import PacksGalleryZone from "@/components/PacksGalleryZone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { LuArrowLeft, LuSparkles } from "react-icons/lu"; // Mantenemos LuSparkles
import { redirect } from "next/navigation";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

// Página de Galería de Estilos - Versión Híbrida
export default async function PacksGalleryPage() {
  if (!packsIsEnabled) {
    redirect('/overview');
  }

  const sideColumnWidth = "md:w-24";

  return (
    // Contenedor principal con fondo normal y padding
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 min-h-screen"> {/* Fondo simple */}
      {/* Layout Grid de 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 lg:gap-x-8 items-start">

        {/* --- Columna 1: Botón Volver (Estilo Anterior) --- */}
        <div className={`w-full md:w-auto mb-6 md:mb-0 flex md:justify-end ${sideColumnWidth}`}>
             <Link href="/overview" className="inline-block">
                <Button
                  variant="secondary" // <-- Variante anterior
                  size="sm"
                  className="
                    text-gray-600 dark:text-gray-400
                    hover:bg-gray-200/80 dark:hover:bg-gray-700/80
                    hover:text-gray-700 dark:hover:text-gray-300
                    transition-all duration-150 ease-in-out
                    px-3
                  "
                >
                  <LuArrowLeft className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Volver
                </Button>
              </Link>
        </div>

        {/* --- Columna 2: Contenido Principal (Centro con Card) --- */}
        {/* Contenedor central con ancho máximo */}
        <div className="w-full max-w-5xl mx-auto"> {/* Mantenemos el max-width */}
          <Card className="shadow-md dark:shadow-lg dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 rounded-xl">
            {/* Encabezado con textos anteriores pero manteniendo el icono */}
            <CardHeader className="border-b border-gray-200/80 dark:border-gray-700/60 px-6 py-5 md:px-8 md:py-6">
              <div className="flex items-center gap-2.5 mb-1"> {/* Ajuste de gap */}
                 <LuSparkles className="w-5 h-5 text-[#4C66FE] flex-shrink-0" /> {/* Icono mantenido */}
                 <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                   Galería de Estilos {/* <-- Título anterior */}
                 </CardTitle>
              </div>
              <CardDescription className="text-gray-500 dark:text-gray-400 pt-0.5 text-sm md:text-base pl-[calc(1.25rem+0.625rem)]"> {/* Alineado con texto del título (aprox) */}
                Elige el estilo de imágenes que te gustaría crear. {/* <-- Descripción anterior */}
              </CardDescription>
            </CardHeader>
            {/* Contenido con padding */}
            <CardContent className="p-6 md:p-8">
              <PacksGalleryZone />
            </CardContent>
          </Card>
        </div>

        {/* --- Columna 3: Espaciador --- */}
        <div className={`hidden md:block ${sideColumnWidth}`}>
             
        </div>

      </div> {/* Fin Grid */}
    </div> // Fin Contenedor Página
  );
}