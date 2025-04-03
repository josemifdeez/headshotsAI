"use client";

import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { FaFemale, FaMale, FaRainbow } from "react-icons/fa";
import { LuUploadCloud, LuLoader2, LuX, LuImagePlus, LuInfo, LuCheckCircle } from "react-icons/lu";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";

import { useDropzone } from "react-dropzone";
import { upload } from "@vercel/blob/client";


type FormInput = z.infer<typeof fileUploadFormSchema>;
const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const MIN_FILES = 4;
const MAX_FILES = 10;
const MAX_TOTAL_SIZE_MB = 4.5;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;


export default function TrainModelZoneHybrid({ packSlug }: { packSlug: string }) {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();
    const router = useRouter();


    const form = useForm<FormInput>({
        resolver: zodResolver(fileUploadFormSchema),
        defaultValues: {
            name: "",
            type: "man",
        },
        mode: "onChange",
    });


    const { totalSize, totalSizeMB, fileCountStatus } = useMemo(() => {
        const size = files.reduce((acc, file) => acc + file.size, 0);
        let status: 'default' | 'warning' | 'error' | 'success' = 'default';
        if (files.length > 0 && files.length < MIN_FILES) status = 'warning';
        if (files.length > MAX_FILES || size > MAX_TOTAL_SIZE_BYTES) status = 'error';
        else if (files.length >= MIN_FILES && files.length <= MAX_FILES) status = 'success';


        return {
            totalSize: size,
            totalSizeMB: (size / (1024 * 1024)).toFixed(1),
            fileCountStatus: status,
        };
    }, [files]);


    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
             const currentFileCount = files.length;
            let addedFilesCount = 0;
            let duplicateFilesCount = 0;
            let oversizedFilesCount = 0;
            let overLimitFilesCount = 0;

            const newFiles: File[] = [];
            let currentCombinedSize = totalSize;

            acceptedFiles.forEach((file) => {
                const isDuplicate = files.some((f) => f.name === file.name && f.size === file.size);
                const wouldExceedCount = currentFileCount + newFiles.length + 1 > MAX_FILES;
                const wouldExceedSize = currentCombinedSize + file.size > MAX_TOTAL_SIZE_BYTES;

                if (isDuplicate) {
                    duplicateFilesCount++;
                } else if (wouldExceedCount) {
                    overLimitFilesCount++;
                } else if (wouldExceedSize) {
                     oversizedFilesCount++;
                } else {
                    newFiles.push(file);
                    currentCombinedSize += file.size;
                    addedFilesCount++;
                }
            });

             const fileTypeRejections = rejectedFiles.filter(f => f.errors.some((e:any) => e.code === 'file-invalid-type'));

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);


             if (addedFilesCount > 0) {
                 if (duplicateFilesCount === 0 && oversizedFilesCount === 0 && overLimitFilesCount === 0 && fileTypeRejections.length === 0) {
                    toast({
                         title: `✅ ${addedFilesCount} Imagen(es) añadida(s)`,
                         description: "¡Listas para el entrenamiento!",
                         duration: 3000,
                    });
                 } else {
                     toast({
                        title: `✔️ ${addedFilesCount} Imagen(es) añadida(s)`,
                        description: "Algunos archivos no pudieron añadirse (ver otros mensajes).",
                        duration: 4000,
                   });
                 }
            }
             if (duplicateFilesCount > 0) {
                toast({
                    variant: "default",
                    title: `🟡 ${duplicateFilesCount} Archivo(s) duplicado(s)`,
                    description: "Se omitieron imágenes que ya estaban en la lista.",
                    duration: 4000,
                });
            }
            if (overLimitFilesCount > 0) {
                 toast({
                    variant: "destructive",
                    title: `⛔ ${overLimitFilesCount} Archivo(s) no añadido(s)`,
                    description: `Se alcanzó el límite máximo de ${MAX_FILES} imágenes.`,
                    duration: 5000,
                });
            }
            if (oversizedFilesCount > 0) {
                toast({
                     variant: "destructive",
                     title: `⛔ Archivo(s) no añadido(s)`,
                     description: `Añadir estas imágenes superaría el límite total de ${MAX_TOTAL_SIZE_MB}MB.`,
                     duration: 5000,
                });
            }
             if (fileTypeRejections.length > 0) {
                toast({
                     variant: "destructive",
                     title: `⛔ ${fileTypeRejections.length} Archivo(s) con formato inválido`,
                     description: "Solo se permiten imágenes PNG, JPG, WEBP.",
                     duration: 5000,
                });
            }
        },
        [files, toast, totalSize]
    );

    const removeFile = useCallback((fileToRemove: File) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    }, []);


     const trainModel = useCallback(async () => {
        if (fileCountStatus !== 'success') {
             toast({
                variant: "destructive",
                title: "Revisión necesaria",
                description: `Asegúrate de tener entre ${MIN_FILES} y ${MAX_FILES} imágenes y no superar ${MAX_TOTAL_SIZE_MB}MB.`,
            });
            return;
        }

        setIsLoading(true);
        const blobUrls = [];

        try {
            for (const file of files) {
                try {
                    const blob = await upload(file.name, file, {
                        access: "public",
                        handleUploadUrl: "/astria/train-model/image-upload",
                    });
                    blobUrls.push(blob.url);
                } catch (uploadError) {
                    console.error(`Error uploading file ${file.name}:`, uploadError);
                    throw new Error(`Error al subir el archivo ${file.name}. Por favor, inténtalo de nuevo.`);
                }
            }

            const payload = {
                urls: blobUrls,
                name: form.getValues("name").trim() || `Mi Modelo ${new Date().toLocaleDateString()}`,
                type: form.getValues("type"),
                pack: packSlug,
                characteristics: {},
            };


            console.log("Sending payload to /astria/train-model:", payload);

            const response = await fetch("/astria/train-model", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                 let errorData = { message: `Error del servidor: ${response.status}` };
                try {
                    errorData = await response.json();
                } catch (parseError) {
                    console.error("Could not parse error response JSON:", parseError);
                    errorData.message = response.statusText || errorData.message;
                }

                const errorMessage = errorData.message || "Error desconocido al entrenar.";
                console.error("Training API Error Status:", response.status);
                console.error("Training API Error Body:", errorData);

                const messageContent = errorMessage.includes("Not enough credits") ? (
                     <div className="flex flex-col gap-3 items-start">
                        <span>Créditos insuficientes para iniciar el entrenamiento.</span>
                        <Button variant="link" size="sm" onClick={() => router.push("/get-credits")} className="p-0 h-auto text-[#4C66FE]">
                            Obtener más créditos
                        </Button>
                    </div>
                ) : (
                    `Ocurrió un problema al iniciar el entrenamiento. (${errorMessage})`
                );

                toast({
                    variant: "destructive",
                    title: "❌ ¡Error al entrenar!",
                    description: messageContent,
                    duration: 7000,
                });

            } else {
                toast({
                    title: "🚀 ¡Entrenamiento iniciado!",
                    description: "Tu modelo está en la cola. Recibirás un email cuando esté listo.",
                    duration: 6000,
                });
                router.push("/overview");
                form.reset();
                setFiles([]);
            }
        } catch (error: any) {
            console.error("Error during training process:", error);
            toast({
                variant: "destructive",
                title: "🤯 Error Inesperado",
                description: error.message || "Algo salió mal durante el proceso. Por favor, inténtalo de nuevo.",
                duration: 7000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [files, totalSize, form, packSlug, router, toast, fileCountStatus]);


    const onSubmit: SubmitHandler<FormInput> = (data) => {
        console.log("Form submitted, calling trainModel...");
        trainModel();
    };


     const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/webp": [".webp"],
        },
        disabled: isLoading || files.length >= MAX_FILES,
        noClick: isLoading || files.length >= MAX_FILES,
        noKeyboard: isLoading || files.length >= MAX_FILES,
    });


    return (
        <div className="w-full max-w-7xl mx-auto py-10 md:py-16 px-4 sm:px-6 lg:px-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-12 md:space-y-16"
                >
                    <div className="flex flex-col space-y-10 md:space-y-0 md:flex-row md:gap-8 lg:gap-12 xl:gap-16">

                        <div className="md:w-1/2 flex flex-col">
                        <span className="text-3xl font-bold text-[#4C66FE] -translate-y-1">

                        </span>
                            <div className="flex items-center gap-3 mb-5">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#CED5FE] to-[#4C66FE] text-white font-semibold text-base shadow-lg shadow-[#4C66FE]/30 border border-white/30">
                                    1
                                </span>
                                <h2 id="details-heading" className="text-xl md:text-2xl font-semibold tracking-tight text-gray-800">
                                    Detalles del modelo
                                </h2>
                            </div>
                            <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white h-full">
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">Nombre del Modelo</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ej: Mi sesión de fotos profesional"
                                                        {...field}
                                                        className="text-base border-gray-300 focus:border-[#4C66FE] focus:ring-1 focus:ring-[#4C66FE]/50"
                                                        autoComplete="off"
                                                        disabled={isLoading}
                                                        aria-describedby="name-description name-message"
                                                    />
                                                </FormControl>
                                                <FormDescription id="name-description" className="text-sm text-gray-500 !mt-1.5">
                                                    Dale un nombre único para identificarlo fácilmente (opcional).
                                                </FormDescription>
                                                <FormMessage id="name-message" className="!mt-1 text-red-600" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-medium">Género Base</FormLabel>
                                            <FormDescription id="type-description" className="text-sm text-gray-500 !mt-1">
                                                Selecciona el género principal para guiar a la IA.
                                            </FormDescription>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="grid grid-cols-3 gap-4 pt-2"
                                                    disabled={isLoading}
                                                    aria-labelledby="type-description"
                                                >
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="man" id="man" className="peer sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor="man"
                                                            className={`flex flex-col items-center justify-center rounded-md border-2 border-gray-200 bg-white p-4 transition-colors duration-200 ease-in-out cursor-pointer hover:bg-indigo-50 hover:border-[#4C66FE] peer-data-[state=checked]:border-[#2539B0] peer-data-[state=checked]:bg-[#CED5FE]/30 peer-data-[state=checked]:text-[#2539B0] [&:has([data-state=checked])]:ring-2 [&:has([data-state=checked])]:ring-[#4C66FE]/50 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                            >
                                                            <FaMale className="mb-2 h-6 w-6" aria-hidden="true" />
                                                            <span className="font-medium text-sm">Hombre</span>
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="woman" id="woman" className="peer sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor="woman"
                                                            className={`flex flex-col items-center justify-center rounded-md border-2 border-gray-200 bg-white p-4 transition-colors duration-200 ease-in-out cursor-pointer hover:bg-indigo-50 hover:border-[#4C66FE] peer-data-[state=checked]:border-[#2539B0] peer-data-[state=checked]:bg-[#CED5FE]/30 peer-data-[state=checked]:text-[#2539B0] [&:has([data-state=checked])]:ring-2 [&:has([data-state=checked])]:ring-[#4C66FE]/50 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                            >
                                                            <FaFemale className="mb-2 h-6 w-6" aria-hidden="true" />
                                                            <span className="font-medium text-sm">Mujer</span>
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="person" id="person" className="peer sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor="person"
                                                            className={`flex flex-col items-center justify-center rounded-md border-2 border-gray-200 bg-white p-4 transition-colors duration-200 ease-in-out cursor-pointer hover:bg-indigo-50 hover:border-[#4C66FE] peer-data-[state=checked]:border-[#2539B0] peer-data-[state=checked]:bg-[#CED5FE]/30 peer-data-[state=checked]:text-[#2539B0] [&:has([data-state=checked])]:ring-2 [&:has([data-state=checked])]:ring-[#4C66FE]/50 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                        >
                                                            <FaRainbow className="mb-2 h-6 w-6" aria-hidden="true" />
                                                            <span className="font-medium text-sm">Unisex</span>
                                                        </Label>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage id="type-message" className="!mt-1 text-red-600" />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>


                        <section aria-labelledby="upload-heading" className="md:w-1/2 flex flex-col">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#CED5FE] to-[#4C66FE] text-white font-semibold text-base shadow-lg shadow-[#4C66FE]/30 border border-white/30">
                                    2
                                </span>
                                <h2 id="upload-heading" className="text-xl md:text-2xl font-semibold tracking-tight text-gray-800">
                                    Sube tus Imágenes
                                </h2>
                            </div>
                            <div className="p-6 md:p-8 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
                                <div
                                    {...getRootProps()}
                                    aria-label="Zona para soltar imágenes"
                                    className={`
                                        relative flex flex-col items-center justify-center w-full min-h-[180px] md:min-h-[220px] p-6
                                        border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out
                                        group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4C66FE]/80 focus-visible:border-transparent
                                        ${isLoading || files.length >= MAX_FILES
                                            ? 'cursor-not-allowed opacity-70 bg-gray-50 border-gray-300'
                                            : 'cursor-pointer border-gray-300 hover:border-[#4C66FE] bg-indigo-50/30 hover:shadow-inner'}
                                        ${isDragAccept ? 'border-[#2539B0] bg-[#CED5FE]/30' : ''}
                                        ${isDragReject ? 'border-red-500 bg-red-50/50' : ''}
                                    `}
                                >
                                    <input {...getInputProps()} disabled={isLoading || files.length >= MAX_FILES}/>
                                    <div className="text-center space-y-3 z-10 pointer-events-none">
                                        <LuUploadCloud
                                            aria-hidden="true"
                                            className={`
                                                w-12 h-12 md:w-14 md:h-14 mx-auto transition-colors duration-300
                                                ${isDragAccept ? 'text-[#2539B0]' : ''}
                                                ${isDragReject ? 'text-red-600' : ''}
                                                ${!isDragActive ? 'text-[#4C66FE] group-hover:text-[#2539B0]' : ''}
                                                ${(isLoading || files.length >= MAX_FILES) && !isDragActive ? 'text-gray-400' : ''}
                                            `}
                                        />
                                        {isDragAccept && <p className="text-base md:text-lg font-semibold text-[#2539B0]">¡Perfecto! Suelta las imágenes aquí.</p>}
                                        {isDragReject && <p className="text-base md:text-lg font-semibold text-red-600">Formato no válido o demasiados archivos.</p>}
                                        {!isDragActive && !isLoading && files.length < MAX_FILES && (
                                            <>
                                                <p className="text-base md:text-lg font-semibold text-gray-700">Arrastra tus fotos o haz clic</p>
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    Necesitas de {MIN_FILES} a {MAX_FILES} imágenes (PNG, JPG, WEBP)
                                                <br /> Máximo {MAX_TOTAL_SIZE_MB}MB en total.
                                                </p>
                                            </>
                                        )}
                                        {!isDragActive && !isLoading && files.length >= MAX_FILES && (
                                             <p className="font-medium text-gray-600">Has alcanzado el límite de {MAX_FILES} imágenes.</p>
                                        )}
                                        {!isDragActive && isLoading && (
                                             <p className="font-medium text-gray-600 flex items-center"><LuLoader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</p>
                                        )}
                                    </div>
                                </div>

                                {files.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex justify-between items-end mb-3">
                                            <h4 className="text-base font-semibold text-gray-800">
                                                Imágenes ({files.length}/{MAX_FILES})
                                            </h4>
                                            <p className={`text-xs md:text-sm font-medium flex items-center gap-1
                                                ${fileCountStatus === 'success' ? 'text-green-600' : ''}
                                                ${fileCountStatus === 'warning' ? 'text-yellow-600' : ''}
                                                ${fileCountStatus === 'error' ? 'text-red-600' : ''}
                                                ${fileCountStatus === 'default' ? 'text-gray-500' : ''}
                                            `}>
                                                {fileCountStatus === 'warning' && <LuInfo size={14} aria-hidden="true" />}
                                                {fileCountStatus === 'success' && <LuCheckCircle size={14} aria-hidden="true" />}
                                                {(fileCountStatus === 'error' || fileCountStatus === 'default') && <LuInfo size={14} aria-hidden="true" />}
                                                {totalSizeMB}MB / {MAX_TOTAL_SIZE_MB}MB
                                            </p>
                                        </div>
                                        <Progress
                                            value={Math.min(100, (totalSize / MAX_TOTAL_SIZE_BYTES) * 100)}
                                            aria-label={`Progreso de subida: ${files.length} de ${MAX_FILES} imágenes, ${totalSizeMB}MB de ${MAX_TOTAL_SIZE_MB}MB`}
                                            className={
                                                `h-2 mb-4 ` +
                                                `[&>div]:transition-all [&>div]:duration-500 [&>div]:ease-out ` +
                                                `${
                                                    fileCountStatus === 'success' ? '[&>div]:bg-green-500' :
                                                    fileCountStatus === 'warning' ? '[&>div]:bg-yellow-500' :
                                                    fileCountStatus === 'error'   ? '[&>div]:bg-red-500' :
                                                                                 '[&>div]:bg-gradient-to-r [&>div]:from-[#CED5FE] [&>div]:to-[#4C66FE]'
                                                }`
                                            }
                                        />
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                            {files.map((file, index) => (
                                                <div key={`${file.name}-${file.lastModified}-${index}`} className="relative group aspect-square overflow-hidden rounded-md shadow-sm border border-gray-200">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Vista previa ${index + 1}: ${file.name}`}
                                                        className="object-cover w-full h-full transition-transform duration-300 ease-out group-hover:scale-105"
                                                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 z-10 h-6 w-6 p-1 rounded-full bg-black/40 hover:bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 backdrop-blur-sm"
                                                        onClick={(e) => { e.stopPropagation(); removeFile(file); }}
                                                        disabled={isLoading}
                                                        aria-label={`Eliminar ${file.name}`}
                                                    >
                                                        <LuX className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {files.length < MAX_FILES && !isLoading && (
                                                <button
                                                    type="button"
                                                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                                    className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-[#4C66FE] hover:text-[#4C66FE] transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4C66FE] focus-visible:border-[#4C66FE]"
                                                    aria-label="Añadir más imágenes"
                                                    disabled={isLoading}
                                                >
                                                    <LuImagePlus size={28} className="mb-1" aria-hidden="true"/>
                                                    <span className="text-[11px] font-medium">Añadir más</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>


                    <section aria-labelledby="submit-heading" className="text-center pt-4">
                         <h3 id="submit-heading" className="sr-only">Confirmar y Entrenar</h3>
                        {(files.length > 0 && fileCountStatus !== 'success') && (
                             <p role="alert" className={`text-sm font-medium mb-4 flex items-center justify-center gap-1.5
                                 ${fileCountStatus === 'warning' ? 'text-yellow-700' : ''}
                                 ${fileCountStatus === 'error' ? 'text-red-600' : ''}
                             `}>
                                <LuInfo size={16} aria-hidden="true" />
                                {files.length < MIN_FILES && `Necesitas al menos ${MIN_FILES} imágenes. Añade ${MIN_FILES - files.length} más.`}
                                {files.length > MAX_FILES && `Has superado el límite de ${MAX_FILES} imágenes. Elimina ${files.length - MAX_FILES}.`}
                                {totalSize > MAX_TOTAL_SIZE_BYTES && files.length <= MAX_FILES && `Has superado el límite de tamaño total (${MAX_TOTAL_SIZE_MB}MB).`}
                            </p>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full max-w-sm group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold tracking-wide text-white rounded-full bg-gradient-to-r from-[#4C66FE] to-[#2539B0] shadow-lg transition-all duration-300 ease-out hover:shadow-[0_0_20px_7px_rgba(76,102,254,0.3)] hover:from-[#5C76FF] hover:to-[#3A4CC0] active:scale-[0.96] active:shadow-[0_0_10px_5px_rgba(76,102,254,0.25)] active:from-[#4C66FE] active:to-[#2539B0] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-500"
                            disabled={isLoading || fileCountStatus !== 'success'}
                            aria-describedby={stripeIsConfigured ? "credit-notice" : undefined}
                        >
                            {isLoading ? (
                                <>
                                    <LuLoader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                    Entrenando Modelo...
                                </>
                            ) : (
                                <>
                                    Entrenar Modelo Ahora
                                    {stripeIsConfigured && <span className="ml-1.5 opacity-90 text-sm font-normal tracking-normal"> (1 Crédito)</span>}
                                </>
                            )}
                        </Button>
                         {stripeIsConfigured && (
                             <p id="credit-notice" className="text-xs text-center text-gray-500 mt-3">
                                Se consumirá 1 crédito al iniciar el entrenamiento.
                            </p>
                         )}
                    </section>
                </form>
            </Form>
        </div>
    );
}