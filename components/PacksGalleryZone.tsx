'use client'
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Link from "next/link";
import { Loader2, ImageOff, Wand2 } from "lucide-react"; // Mantenemos Wand2

// --- Interfaces, variables y traducciones (sin cambios lógicos) ---
interface Pack {
  id: string;
  title: string;
  cover_url: string;
  slug: string;
}
const allowedSlugsString = process.env.NEXT_PUBLIC_ALLOWED_PACK_SLUGS || '';
const ALLOWED_PACK_SLUGS: string[] = allowedSlugsString.split(',').map(slug => slug.trim()).filter(slug => slug);
const PACK_TITLE_TRANSLATIONS: { [key: string]: string } = {
  "corporate-headshots": "Corporativo",
  "stylish-studio-portraits": "Estudio Fotográfico",
  "portraits_minimalist": "Minimalista",
  "speaker": "Orador",
  "elegant-street-style": "Urbano",
  "modelsempire": "Casual",
};
// ----------------------------------------------------

// Componente de Galería - Versión Híbrida
export default function PacksGalleryZone() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // --- Lógica Fetch (sin cambios) ---
  const fetchPacks = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<Pack[]>('/astria/packs');
      const allPacks = response.data;
      const filteredPacks = allPacks.filter(pack => ALLOWED_PACK_SLUGS.includes(pack.slug));
      // await new Promise(resolve => setTimeout(resolve, 500)); // Quitar o mantener si quieres simular carga
      setPacks(filteredPacks);
    } catch (err: unknown) {
      console.error("Error fetching packs:", err);
      let description = "Ocurrió un error inesperado al cargar los estilos.";
      if (axios.isAxiosError(err)) { description = err.response?.data?.message || err.message || "No se pudo conectar."; }
      else if (err instanceof Error) { description = err.message; }
      toast({ variant: "destructive", title: "Error al Cargar", description, duration: 6000 });
      setPacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPacks(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // --- Renderizado Híbrido ---

  // Estado de Carga (Simplificado)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-[#4C66FE] mb-5" /> {/* Loader más simple */}
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Cargando Estilos...</p>
      </div>
    );
   }

  // Estado Vacío (Mantenemos el estilo con Wand2)
  if (packs.length === 0) {
    const message = ALLOWED_PACK_SLUGS.length === 0
      ? "Aún no hay estilos disponibles."
      : "No encontramos los estilos buscados.";
    const description = ALLOWED_PACK_SLUGS.length === 0
      ? "Parece que la galería está esperando nuevas inspiraciones. Vuelve pronto."
      : "Quizás un filtro mágico se aplicó mal. Intenta ajustar tu búsqueda o revisa la configuración.";
    return (
       <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-br from-[#CED5FE]/10 to-transparent dark:from-[#2539B0]/10 rounded-2xl border border-dashed border-[#4C66FE]/30 dark:border-[#4C66FE]/20 min-h-[400px]">
          <Wand2 className="mx-auto h-16 w-16 text-[#4C66FE]/70 mb-5 opacity-80" strokeWidth={1.5}/>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{message}</p>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto">{description}</p>
       </div>
     );
  }

  // Renderizado de la Galería - Tamaño Anterior, Texto Superpuesto, Sin Glow
  return (
    // Grid con espaciado ajustado
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-8">
      {packs.map((pack) => {
        const displayTitle = PACK_TITLE_TRANSLATIONS[pack.slug] || pack.title;

        return (
          <Link
            href={`/overview/models/train/${pack.slug}`}
            key={pack.id}
            // Estilo del Link: foco visible, transición, ligero scale on hover
            className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 focus-visible:ring-[#4C66FE] rounded-xl transition-transform duration-300 ease-out will-change-transform hover:scale-[1.03]" // rounded-xl como antes
            aria-label={`Seleccionar estilo ${displayTitle}`}
          >
            {/* SIN EFECTO GLOW */}

            {/* Contenedor principal de la imagen */}
            {/* ******** CAMBIO AQUÍ: Volvemos a aspect-[3/4] y max-w-40 (ajustable) ******** */}
            <div className="relative aspect-[3/4] w-full max-w-40 mx-auto overflow-hidden rounded-xl shadow-lg dark:shadow-xl shadow-gray-400/20 dark:shadow-black/30 border border-black/5 dark:border-white/10"> {/* Tamaño restaurado */}
            {/* ******************************************************************************* */}
              <img
                src={pack.cover_url ?? "placeholder_image_url"}
                alt={`Vista previa del estilo ${displayTitle}`}
                // Imagen cubre el contenedor, sin scale on hover para la imagen
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95" // Opacidad sutil en hover
                loading="lazy"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Placeholder SVG 3:4
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 75 100' fill='%23d1d5db'%3E%3Crect width='75' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M15 75 L35 40 L50 60 L60 50 L65 75 Z' stroke='%239ca3af' stroke-width='2' fill='none' /%3E%3Ccircle cx='55' cy='35' r='5' fill='%239ca3af'/%3E%3C/svg%3E";
                    target.alt = `Error al cargar imagen para ${displayTitle}`;
                 }}
              />
               {/* Fallback */}
               {!pack.cover_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <ImageOff className="w-10 h-10 text-gray-400 dark:text-gray-500 opacity-70" />
                  </div>
               )}
                {/* Overlay Gradiente MANTENIDO */}
               <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/60 to-transparent pointer-events-none"></div>

                {/* Título Superpuesto MANTENIDO */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                   <h3 className="font-semibold text-base md:text-lg text-white drop-shadow-sm capitalize transition-colors duration-300 group-hover:text-[#CED5FE]">
                     {displayTitle}
                   </h3>
                </div>
            </div> {/* Fin contenedor imagen */}
          </Link> // Fin Link
        );
      })}
    </div> // Fin Grid
  );
}