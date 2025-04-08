"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

import { Icons } from "@/components/icons";
import { Database } from "@/types/supabase";
// Asegúrate que estos tipos sean correctos y 'uri' exista en imageRow y sampleRow
import { imageRow, modelRow, sampleRow } from "@/types/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
// import { toast } from "sonner"; // Descomenta si decides usar Sonner para notificaciones

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
    samples: sampleRow[]; // Asegúrate de que este prop se esté pasando al componente
};

export default function ClientSideModel({
    serverModel,
    serverImages,
    samples, // Recibimos las imágenes de entrenamiento
}: ClientSideModelProps) {
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
    const [model, setModel] = useState<modelRow>(serverModel);
    const [downloadingImageId, setDownloadingImageId] = useState<number | null>(null);

    useEffect(() => {
        // Código de suscripción a Supabase realtime (sin cambios)
        const channel = supabase
            .channel(`realtime-model-${model.id}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "models", filter: `id=eq.${model.id}` },
                (payload: { new: modelRow }) => {
                    console.log("Realtime update received:", payload.new);
                    if (payload.new.id === model.id) { setModel(payload.new); }
                }
            )
            .subscribe((status) => { console.log(`Supabase channel status: ${status}`); });
        return () => {
            console.log(`Removing channel for model ${model.id}`);
            supabase.removeChannel(channel);
        };
    }, [supabase, model.id]);

    // --- Valores booleanos derivados del estado ---
    const isLoading = model.status === 'processing' || model.status === 'starting';
    const isFinished = model.status === 'finished';
    const hasFailed = model.status === 'failed';
    // --- FIN Valores booleanos ---

    // Función para generar un nombre de archivo seguro (sin cambios)
    const generateFilename = (image: imageRow): string => {
        const uri = image.uri || ''; // Manejar posible undefined/null
        const extensionMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
        const extension = extensionMatch ? `.${extensionMatch[1]}` : '.png';
        const cleanModelName = serverModel.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'model';
        const safeFilenameBase = `generated_${cleanModelName}_${image.id}${extension}`;
        return safeFilenameBase.replace(/[\/\?<>\\:\*\|":]/g, '_');
    };

    // Función para descargar usando el Proxy API Route (sin cambios)
    const handleDownload = async (astriaImageUrl: string, filename: string, imageId: number) => {
        if (downloadingImageId !== null || !astriaImageUrl) return;

        setDownloadingImageId(imageId);
        // toast.info(`Iniciando descarga de ${filename}...`);

        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(astriaImageUrl)}&filename=${encodeURIComponent(filename)}`;

        try {
            console.log(`[Download] Llamando al proxy: ${proxyUrl}`);
            const response = await fetch(proxyUrl);
            console.log(`[Download] Respuesta del proxy recibida: Status ${response.status}`);

            if (!response.ok) {
                let errorMsg = `Error del proxy: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody && errorBody.error) { errorMsg = `Error del proxy (${response.status}): ${errorBody.error}`; }
                } catch (_) { /* Ignorar si el cuerpo no es JSON */ }
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);

            console.log(`[Download] Descarga de ${filename} iniciada.`);
            // toast.success(`${filename} descargado!`);

        } catch (error: unknown) {
            console.error("[Download] Error durante la descarga vía proxy:", error);
            let alertMessage = `Error al descargar "${filename}"`;
            if (error instanceof Error) { alertMessage += `: ${error.message}`; }
            // toast.error(alertMessage);
            alert(alertMessage); // Considera usar un método de notificación menos intrusivo
        } finally {
            setDownloadingImageId(null);
        }
    };

    return (
        <div className="w-full">
            {/* Contenedor principal: 2 columnas en LG+, separadas por gap */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">

                {/* --- Columna 1: Datos de Entrenamiento (1/3 Ancho en LG) --- */}
                {/* Solo se muestra si hay 'samples' */}
                {samples && samples.length > 0 && (
                    <motion.div
                        className="flex w-full lg:w-1/3 flex-col gap-4" // Ocupa 1/3 en LG
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* Título: Mismo tamaño que el de resultados */}
                        <h2 className="text-2xl font-semibold text-foreground/80 flex items-center gap-2">
                            <Icons.upload className="w-5 h-5 text-primary" />
                            Datos de Entrenamiento
                        </h2>
                        {/* Grid de Imágenes: 3 columnas, gap pequeño para hacerlas más chicas */}
                        <motion.div
                            className="grid grid-cols-3 gap-2 sm:gap-3"
                            variants={containerVariants}
                        >
                            {samples.map((sample) => (
                                <motion.div
                                    key={sample.id}
                                    className="relative group"
                                    variants={itemVariants}
                                >
                                    {/* AspectRatio mantiene la proporción cuadrada */}
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
                {/* --- FIN: Columna 1 --- */}


                {/* --- Columna 2: Resultados del Modelo (2/3 Ancho en LG o Completo si no hay Col 1) --- */}
                {/* Ancho condicional basado en la existencia de 'samples' */}
                <div className={`flex flex-col w-full ${samples && samples.length > 0 ? 'lg:w-2/3' : 'lg:w-full'} gap-4`}>
                    {/* Título */}
                    <h2 className="text-2xl font-semibold text-foreground/80 flex items-center gap-2">
                        <Icons.sparkles className="w-5 h-5 text-primary" />
                        Resultados del Modelo
                    </h2>

                    {/* --- Renderizado Condicional del Contenido de Resultados --- */}
                    {isFinished ? (
                        // Estado: Finalizado
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4" // Grid de resultados sin cambios
                            initial="hidden" animate="visible" variants={containerVariants}
                        >
                            {serverImages && serverImages.length > 0 ? (
                                // Mapeo de imágenes generadas
                                serverImages.map((image) => {
                                    const astriaUri = image.uri;
                                    if (!astriaUri) return null;
                                    const filename = generateFilename(image);
                                    const isDownloading = downloadingImageId === image.id;
                                    return (
                                        <motion.div
                                            key={image.id}
                                            className="relative group cursor-pointer"
                                            variants={itemVariants}
                                            whileHover={!isDownloading ? { scale: 1.03, zIndex: 10 } : {}}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                            onClick={() => !isDownloading && handleDownload(astriaUri, filename, image.id)}
                                            title={isDownloading ? "Descargando..." : `Descargar ${filename}`}
                                        >
                                            <AspectRatio
                                                ratio={1 / 1}
                                                className={`bg-muted rounded-lg overflow-hidden border border-transparent shadow-md group-hover:shadow-xl group-hover:border-primary transition-all duration-300 ease-out ${isDownloading ? 'opacity-50 cursor-default pointer-events-none' : ''}`}
                                            >
                                                <img
                                                    src={astriaUri}
                                                    alt={`Generated result ${image.id}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                    loading="lazy"
                                                    onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                                                />
                                                {/* Icono descarga/spinner */}
                                                <div className={`absolute inset-0 bg-black flex items-center justify-center transition-opacity duration-300 ease-out ${isDownloading ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 group-hover:bg-opacity-40 opacity-0 group-hover:opacity-100'}`}>
                                                    {isDownloading ? <Icons.spinner className="w-8 h-8 text-white animate-spin" /> : <Icons.download className="w-8 h-8 text-white opacity-90 drop-shadow-md" />}
                                                </div>
                                            </AspectRatio>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                // Caso: Finalizado pero sin imágenes
                                <div className="col-span-full text-center py-8 px-4 bg-muted rounded-lg border border-border">
                                    <Icons.imageOff className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-foreground font-medium">El entrenamiento finalizó, pero no se generaron imágenes.</p>
                                    <p className="text-sm text-muted-foreground mt-1">Por favor, contacta con soporte si crees que esto es un error.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : isLoading ? (
                        // Estado: Cargando / Procesando
                        <motion.div
                            className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 border border-accent rounded-lg text-center min-h-[250px]"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        >
                            <Icons.cpu className="w-12 h-12 text-primary mb-4 animate-pulse" />
                            <p className="text-lg font-semibold text-primary">Procesando tus imágenes...</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                Nuestra IA está trabajando. Esto suele tardar unos 20 minutos. Te avisaremos por email cuando esté listo.
                            </p>
                            <div className="w-full bg-primary/20 rounded-full h-1.5 mt-6 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full animate-progress indeterminate-progress"></div>
                            </div>
                            {/* CSS para la animación de progreso (si no está global) */}
                            <style jsx>{`
                                @keyframes progress-indeterminate { 0% { transform: translateX(-100%) scaleX(0.1); } 50% { transform: translateX(0%) scaleX(0.6); } 100% { transform: translateX(100%) scaleX(0.1); } }
                                .indeterminate-progress { animation: progress-indeterminate 2s infinite ease-in-out; transform-origin: 0% 50%; }
                            `}</style>
                        </motion.div>
                    ) : hasFailed ? (
                        // Estado: Fallido
                        <motion.div
                            className="flex flex-col items-center justify-center p-8 bg-destructive/10 border border-destructive/30 rounded-lg text-center min-h-[250px]"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        >
                            <Icons.alertTriangle className="w-10 h-10 text-destructive mb-4" />
                            <p className="text-lg font-semibold text-destructive-foreground">¡Ups! Algo salió mal</p>
                            <p className="text-sm text-muted-foreground mt-1">El entrenamiento del modelo no pudo completarse.</p>
                        </motion.div>
                    ) : (
                        // Estado: Inicial / Desconocido
                        <div className="flex flex-col items-center justify-center p-8 bg-muted border border-border rounded-lg text-center min-h-[250px]">
                            <Icons.hourglass className="w-10 h-10 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-foreground/80">Esperando inicio del entrenamiento...</p>
                        </div>
                    )}
                    {/* --- FIN Renderizado Condicional --- */}
                </div>
                {/* --- FIN: Columna 2 --- */}

            </div> {/* Fin del contenedor flex principal */}
        </div> // Fin del div wrapper
    );
}