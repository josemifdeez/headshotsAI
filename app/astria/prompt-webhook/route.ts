// ----- ARCHIVO: ./app/astria/prompt-webhook/route.ts -----

import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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
  type PromptData = {
    id: number;
    text: string;
    negative_prompt: string;
    steps: null;
    tune_id: number;
    trained_at: string;
    started_training_at: string;
    created_at: string;
    updated_at: string;
    images: string[];
  };

  const incomingData = (await request.json()) as { prompt: PromptData };

  const { prompt } = incomingData;

  console.log({ prompt });

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
    // Here we join all of the arrays into one.
    const allHeadshots = prompt.images;

    // --- CORRECCIÓN AQUÍ ---
    // Convertimos model_id a número antes de usarlo en la consulta
    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("*")
      .eq("id", Number(model_id)) // Convertido a número
      .single();
    // --- FIN CORRECCIÓN ---

    if (modelError) {
      console.error({ modelError });
      // Podrías querer devolver un error más específico si model_id no era un número válido
      // o si el modelo no se encontró.
      return NextResponse.json(
        {
          message: `Error finding model: ${modelError.message}`,
        },
        { status: 500 }
      );
    }

    // Si model se encontró, model.id ya será un número (según tu schema de Supabase)
    await Promise.all(
      allHeadshots.map(async (image) => {
        const { error: imageError } = await supabase.from("images").insert({
          modelId: model.id, // Usamos directamente model.id
          uri: image,
        });
        if (imageError) {
          console.error("Error inserting image:", { imageError, imageUri: image, modelId: model.id });
        }
      })
    );

    // Considera también actualizar el estado del modelo aquí si es necesario
    // Ejemplo: await supabase.from("models").update({ status: 'completed' }).eq("id", model.id);

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 200, statusText: "Success" }
    );
  } catch (e) {
    console.error("General error processing webhook:", e);
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 }
    );
  }
}