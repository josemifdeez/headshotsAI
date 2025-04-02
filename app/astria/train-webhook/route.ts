// ----- ARCHIVO: ./app/astria/train-webhook/route.ts -----

import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;

if (!resendApiKey) {
  console.warn(
    "We detected that the RESEND_API_KEY is missing from your environment variables. The app should still work but email notifications will not be sent. Please add your RESEND_API_KEY to your environment variables if you want to enable email notifications."
  );
}

if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

export async function POST(request: Request) {
  type TuneData = {
    id: number; // Astria tune ID (number)
    title: string;
    name: string;
    steps: null;
    trained_at: null;
    started_training_at: null;
    created_at: string;
    updated_at: string;
    expires_at: null;
  };

  const incomingData = (await request.json()) as { tune: TuneData };

  const { tune } = incomingData;

  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const model_id = urlObj.searchParams.get("model_id"); // Obtenido como string
  const webhook_secret = urlObj.searchParams.get("webhook_secret");

  if (!model_id) {
    return NextResponse.json(
      {
        message: "Malformed URL, no model_id detected!",
      },
      { status: 500 }
    );
  }


  if (!webhook_secret) {
    return NextResponse.json(
      {
        message: "Malformed URL, no webhook_secret detected!",
      },
      { status: 500 }
    );
  }

  if (webhook_secret.toLowerCase() !== appWebhookSecret?.toLowerCase()) {
    return NextResponse.json(
      {
        message: "Unauthorized!",
      },
      { status: 401 }
    );
  }

  if (!user_id) {
    return NextResponse.json(
      {
        message: "Malformed URL, no user_id detected!",
      },
      { status: 500 }
    );
  }

  const supabase = createClient<Database>(
    supabaseUrl as string,
    supabaseServiceRoleKey as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(user_id);

  if (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    // --- NOTA: Considera verificar el estado actual del modelo antes de enviar el email ---
    // Quizás ya estaba 'finished' por algún motivo.

    if (resendApiKey && user?.email) { // Asegúrate de que el usuario tiene email
      try {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: "noreply@headshots.tryleap.ai", // Cambia esto a tu dominio si lo tienes configurado
            to: user.email,
            subject: "¡Tu modelo de IA está listo!", // Asunto más amigable
            // Email más informativo
            html: `<h2>¡Buenas noticias!</h2><p>Tu modelo de IA '${tune.name || 'sin nombre'}' ha completado su entrenamiento.</p><p>Ya puedes empezar a generar imágenes. Se ha utilizado 1 crédito de tu cuenta para este entrenamiento.</p><p>¡Gracias por usar Sesiones Fotos IA!</p>`,
          });
          console.log(`Email notification sent successfully to ${user.email}`);
      } catch (emailError) {
          console.error("Error sending email notification:", emailError);
          // Decide si quieres continuar aunque falle el email
      }
    }

    // --- CORRECCIÓN AQUÍ ---
    const { data: modelUpdated, error: modelUpdatedError } = await supabase
      .from("models")
      .update({
        modelId: `${tune.id}`,
        status: "finished",
      })
      .eq("id", Number(model_id)) // <--- Convertido a número
      .select(); // Es bueno seleccionar para confirmar el cambio y loguear


    if (modelUpdatedError) {
      console.error("Error updating model status in DB:", { modelUpdatedError });
      return NextResponse.json(
        {
          message: `Database error updating model: ${modelUpdatedError.message}`,
        },
        { status: 500 }
      );
    }

    if (!modelUpdated || modelUpdated.length === 0) {
      // Esto podría pasar si el model_id no existía o hubo un problema
      console.error(`Failed to update model or model not found for id: ${model_id}`);
      return NextResponse.json(
        { message: `Model with id ${model_id} not found or failed to update.` },
        { status: 404 } // O 500 si prefieres
      );
    }

    console.log("Model status updated successfully in DB:", modelUpdated);

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 200, statusText: "Success" }
    );
  } catch (e) {
    console.error("General error processing train webhook:", e);
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 }
    );
  }
}