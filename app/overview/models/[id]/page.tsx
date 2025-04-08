import Login from "@/app/login/page"; // Adjust path if needed
import { Icons } from "@/components/icons";
import ClientSideModel from "@/components/realtime/ClientSideModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
// Importa el icono específico que quieres del ejemplo
import { ArrowLeft } from "lucide-react"; // Reemplaza FaArrowLeft si usas el icono del ejemplo

export const dynamic = "force-dynamic";

export default async function ModelDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Authentication required");
  }

  // ... (fetch model, images, samples - sin cambios)
  const { data: model, error: modelError } = await supabase
    .from("models")
    .select("*")
    .eq("id", Number(params.id))
    .eq("user_id", user.id)
    .single();

  if (modelError || !model) {
    console.error("Error fetching model or model not found:", modelError);
    redirect("/overview?error=Model not found");
  }

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("modelId", model.id);

  const { data: samples } = await supabase
    .from("samples")
    .select("*")
    .eq("modelId", model.id);

  return (
    <div className="w-full h-full p-4 md:p-6">
      {/* Cabecera: Margen inferior mb-16 mantenido */}
      <div className="flex flex-row gap-4 mb-16">

        {/* 1. BOTÓN VOLVER CON NUEVO ESTILO */}
        {/* Usamos 'inline-block' en Link como en el ejemplo. self-start opcional */}
        <Link href="/overview" className="inline-block self-start">
          {/* Aplicamos variant, size y clases del ejemplo */}
          <Button
            variant="secondary" // Cambiado de 'outline'
            size="sm"
            className="
              text-gray-600 dark:text-gray-400      /* Texto suave */
              hover:bg-gray-200/80 dark:hover:bg-gray-700/80 /* Hover refinado */
              hover:text-gray-700 dark:hover:text-gray-300 /* Texto en hover opcional */
              transition-all duration-150 ease-in-out /* Transición suave */
              px-3                                   /* Padding */
            "
          >
            {/* Icono del ejemplo con sus clases */}
            <ArrowLeft className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Volver
          </Button>
        </Link>

        {/* 2. Grupo Título + Badge */}
        <div className="flex flex-row gap-3 items-center">
          {/* 2a. Título */}
          <h1
            className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200"
            title={model.name ?? ''}
          >
            {model.name ?? 'Modelo sin nombre'}
          </h1>

          {/* 2b. DIV EXTRA contenedor del Badge */}
          <div>
            <Badge
              className={`
                text-xs font-medium px-3 py-1 rounded-full
                flex items-center gap-1.5
                justify-center
                border  
                ${ // Lógica condicional de estilos
                  model.status === "finished"
                    ? "bg-green-100 text-green-700 border-green-300 shadow-sm hover:bg-green-100" // <-- Añadido hover:bg-green-100
                    : model.status === "processing" || model.status === "starting"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" // <-- Añadido hover:bg-yellow-100
                    : model.status === "failed"
                    ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-100" // <-- Añadido hover:bg-red-100
                    : "bg-muted text-muted-foreground border-border hover:bg-muted"
                }
              `}
            >
              {/* Iconos condicionales */}
              {(model.status === "processing" || model.status === "starting") && (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              )}
              {model.status === "failed" && (
                <Icons.alertTriangle className="h-4 w-4" />
              )}
              {model.status === "finished" && (
                <Icons.checkCircle className="h-4 w-4 text-green-600" />
              )}

              {/* Texto del estado */}
              <span className="leading-none">
                {model.status === "finished"
                  ? "Completado"
                  : model.status === "processing"
                  ? "En proceso"
                  : model.status
                }
              </span>
            </Badge>
          </div> {/* Fin del div extra */}
        </div> {/* Fin grupo título+badge */}
      </div> {/* Fin cabecera */}

      <ClientSideModel
         samples={samples ?? []}
         serverModel={model}
         serverImages={images ?? []}
      />
    </div>
  );
}