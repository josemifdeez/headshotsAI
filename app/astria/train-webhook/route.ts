// ----- ARCHIVO: ./app/astria/train-webhook/route.ts -----

import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// --- Log Inicial: Verificando variables de entorno al cargar el módulo ---
console.log("Train Webhook: Loading environment variables...");
const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;

console.log("Train Webhook: RESEND_API_KEY loaded?", !!resendApiKey); // No loguear la key directamente por seguridad
console.log("Train Webhook: NEXT_PUBLIC_SUPABASE_URL loaded?", !!supabaseUrl);
console.log("Train Webhook: SUPABASE_SERVICE_ROLE_KEY loaded?", !!supabaseServiceRoleKey);
console.log("Train Webhook: APP_WEBHOOK_SECRET loaded?", !!appWebhookSecret);
// --- Fin Log Inicial ---

if (!resendApiKey) {
  console.warn(
    "Train Webhook WARNING: RESEND_API_KEY is missing. Emails will not be sent."
  );
}

if (!supabaseUrl) {
  console.error("Train Webhook ERROR: MISSING NEXT_PUBLIC_SUPABASE_URL!");
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  console.error("Train Webhook ERROR: MISSING SUPABASE_SERVICE_ROLE_KEY!");
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

if (!appWebhookSecret) {
  console.error("Train Webhook ERROR: MISSING APP_WEBHOOK_SECRET!");
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

export async function POST(request: Request) {
  console.log("\n--- Train Webhook: POST Request Received ---"); // Separador para claridad
  console.log("Train Webhook: Request URL:", request.url);

  type TuneData = {
    id: number;
    title: string;
    name: string;
    steps: null;
    trained_at: null;
    started_training_at: null;
    created_at: string;
    updated_at: string;
    expires_at: null;
  };

  let incomingData: { tune: TuneData };
  try {
    incomingData = (await request.json()) as { tune: TuneData };
    console.log("Train Webhook: Parsed incoming JSON data:", incomingData);
  } catch (parseError) {
    console.error("Train Webhook ERROR: Failed to parse incoming JSON:", parseError);
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { tune } = incomingData;
  console.log("Train Webhook: Extracted tune data:", tune);

  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const model_id = urlObj.searchParams.get("model_id"); // Obtenido como string
  const webhook_secret = urlObj.searchParams.get("webhook_secret");

  console.log("Train Webhook: Parsed URL Params - user_id:", user_id);
  console.log("Train Webhook: Parsed URL Params - model_id:", model_id);
  console.log("Train Webhook: Parsed URL Params - webhook_secret:", webhook_secret ? '******' : null); // No loguear el secreto directamente

  // --- Validaciones ---
  if (!model_id) {
    console.error("Train Webhook ERROR: Malformed URL, no model_id detected!");
    return NextResponse.json({ message: "Malformed URL, no model_id detected!" }, { status: 500 });
  }

  if (!webhook_secret) {
    console.error("Train Webhook ERROR: Malformed URL, no webhook_secret detected!");
    return NextResponse.json({ message: "Malformed URL, no webhook_secret detected!" }, { status: 500 });
  }

  // Comparación segura (insensible a mayúsculas/minúsculas)
  const secretsMatch = webhook_secret.toLowerCase() === appWebhookSecret?.toLowerCase();
  console.log("Train Webhook: Comparing webhook secrets... Match:", secretsMatch);
  if (!secretsMatch) {
    console.error("Train Webhook ERROR: Unauthorized! Webhook secret does not match.");
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  if (!user_id) {
    console.error("Train Webhook ERROR: Malformed URL, no user_id detected!");
    return NextResponse.json({ message: "Malformed URL, no user_id detected!" }, { status: 500 });
  }
  // --- Fin Validaciones ---

  console.log("Train Webhook: Initializing Supabase client...");
  const supabase = createClient<Database>(
    supabaseUrl as string,
    supabaseServiceRoleKey as string,
    { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
  );
  console.log("Train Webhook: Supabase client initialized.");

  console.log("Train Webhook: Fetching user data for user_id:", user_id);
  const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

  if (userError) {
    console.error("Train Webhook ERROR: Error fetching user from Supabase:", userError);
    return NextResponse.json({ message: userError.message }, { status: 401 });
  }

  if (!user) {
    console.error("Train Webhook ERROR: User not found for user_id:", user_id, "- Unauthorized");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  console.log("Train Webhook: User found successfully. User ID:", user.id, "User Email:", user.email);


  try {
    console.log("Train Webhook: --- Starting Email Sending Logic ---");

    // --- Comprobación explícita antes de intentar enviar ---
    console.log("Train Webhook: Checking conditions for sending email...");
    console.log("Train Webhook: RESEND_API_KEY is present?", !!resendApiKey);
    console.log("Train Webhook: User email is present?", !!user?.email);
    // --- Fin Comprobación ---

    if (resendApiKey && user?.email) {
      console.log("Train Webhook: Conditions MET. Attempting to send email via Resend...");
      try {
          const resend = new Resend(resendApiKey);
          const emailPayload = {
            // --- ¡¡¡IMPORTANTE!!! VERIFICAR ESTE VALOR EN LOS LOGS ---
            from: "sesionesfotosia@sesionesfotosia.com",
            // --- FIN IMPORTANTE ---
            to: user.email,
            subject: "¡Tu modelo de IA está listo!",
            html: `<h2>¡Buenas noticias!</h2><p>Tu modelo de IA '${tune.name || 'sin nombre'}' ha completado su entrenamiento.</p><p>Ya puedes empezar a generar imágenes. Se ha utilizado 1 crédito de tu cuenta para este entrenamiento.</p><p>¡Gracias por usar Sesiones Fotos IA!</p>`,
          };

          console.log("Train Webhook: Sending email with payload:", {
              from: emailPayload.from, // Loguear el 'from' exacto que se va a usar
              to: emailPayload.to,
              subject: emailPayload.subject,
              html_preview: emailPayload.html.substring(0, 50) + "..." // Un preview corto del HTML
          });

          const { data: emailData, error: emailError } = await resend.emails.send(emailPayload);

          if (emailError) {
            // Si hay error específico de Resend, loguéalo
            console.error("!!! Train Webhook: Resend API Error sending email:", emailError);
             // Intenta loguear más detalles si están disponibles en el error de Resend
            if (typeof emailError === 'object' && emailError !== null && 'message' in emailError) {
              console.error("Resend Error Message:", (emailError as Error).message);
            }
            // No detengas el flujo necesariamente, podrías querer actualizar la DB igualmente
          } else {
            console.log(`Train Webhook: Email notification sent successfully via Resend to ${user.email}. Resend ID: ${emailData?.id}`);
          }

      } catch (generalEmailError) {
          // Captura errores inesperados durante la inicialización o envío
          console.error("!!! Train Webhook: Unexpected error during email sending block:", generalEmailError);
      }
    } else {
        console.log("Train Webhook: Conditions NOT MET to send email (API Key or User Email missing). Skipping email.");
    }

    console.log("Train Webhook: --- Finished Email Sending Logic ---");
    console.log("Train Webhook: --- Starting Database Update Logic ---");

    const modelIdNumber = Number(model_id);
    console.log("Train Webhook: Attempting to update model in DB. Model ID (as number):", modelIdNumber);
    console.log("Train Webhook: Update payload:", { modelId: `${tune.id}`, status: "finished" });

    if (isNaN(modelIdNumber)) {
       console.error("Train Webhook ERROR: model_id received is not a valid number:", model_id);
       // Decide cómo manejar esto, ¿devolver error? ¿Continuar? Por ahora logueamos y devolvemos error.
        return NextResponse.json(
          { message: `Invalid model_id format: ${model_id}. Expected a number.` },
          { status: 400 } // Bad Request
        );
    }


    const { data: modelUpdated, error: modelUpdatedError } = await supabase
      .from("models")
      .update({
        modelId: `${tune.id}`, // Guarda el ID de Astria (tune.id) como string en tu tabla
        status: "finished",
      })
      .eq("id", modelIdNumber) // Usa el ID numérico de tu tabla
      .select();

    if (modelUpdatedError) {
      console.error("Train Webhook ERROR: Error updating model status in DB:", modelUpdatedError);
      // Decide si quieres devolver error aquí o solo loguear
      return NextResponse.json(
        { message: `Database error updating model: ${modelUpdatedError.message}` },
        { status: 500 }
      );
    }

    if (!modelUpdated || modelUpdated.length === 0) {
      console.error(`Train Webhook WARNING: Failed to update model or model not found for internal id: ${modelIdNumber}`);
      // Podría ser un warning o un error dependiendo de tu lógica
       return NextResponse.json(
        { message: `Model with internal id ${modelIdNumber} not found or failed to update.` },
        { status: 404 } // Not Found podría ser apropiado
      );
    }

    console.log("Train Webhook: Model status updated successfully in DB:", modelUpdated);
    console.log("Train Webhook: --- Finished Database Update Logic ---");

    console.log("Train Webhook: Request processed successfully. Sending 200 OK response.");
    return NextResponse.json({ message: "success" }, { status: 200, statusText: "Success" });

  } catch (e) {
    console.error("!!! Train Webhook: General unexpected error processing webhook:", e);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  } finally {
      console.log("--- Train Webhook: POST Request Finished ---"); // Marca el final
  }
}