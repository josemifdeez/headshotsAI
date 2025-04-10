// app/api/create-checkout-session/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Database } from '@/types/supabase'; // Asegúrate que la ruta es correcta

// Asegúrate de que STRIPE_SECRET_KEY esté definida en tus variables de entorno
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("FATAL ERROR: STRIPE_SECRET_KEY is not defined!");
  // En un entorno real, podrías querer manejar esto de forma más robusta,
  // pero para la API, devolver un 500 es apropiado.
  throw new Error("Stripe secret key not configured.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16', // Usa una versión reciente o la que tengas configurada
  typescript: true,
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn("Unauthorized attempt to create checkout session.");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let priceId: string | undefined;
  try {
    const body = await request.json();
    priceId = body.priceId; // El frontend enviará el priceId
  } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }


  if (!priceId || typeof priceId !== 'string') {
     console.warn(`Missing or invalid priceId received: ${priceId}`);
     return NextResponse.json({ error: 'Missing or invalid priceId' }, { status: 400 });
  }

  // Validar que el priceId es uno de los que ofreces (Importante para seguridad)
  const validPriceIds = [
      process.env.STRIPE_PRICE_ID_ONE_CREDIT,
      process.env.STRIPE_PRICE_ID_THREE_CREDITS,
      process.env.STRIPE_PRICE_ID_FIVE_CREDITS
  ].filter(Boolean); // filter(Boolean) elimina posibles undefined si no están configurados

  if (!validPriceIds.includes(priceId)) {
      console.warn(`Invalid price ID selected: ${priceId}. Valid IDs: ${validPriceIds.join(', ')}`);
      return NextResponse.json({ error: 'Invalid price ID selected.' }, { status: 400 });
  }

  // Asegúrate de tener NEXT_PUBLIC_SITE_URL en tus variables de entorno
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error("FATAL ERROR: NEXT_PUBLIC_SITE_URL is not defined!");
    // No se puede construir success/cancel URL sin esto
    return NextResponse.json({ error: 'Application configuration error.' }, { status: 500 });
  }

  try {
    console.log(`Creating Stripe session for user ${user.id} with priceId ${priceId}`);

    const session = await stripe.checkout.sessions.create({
      // --- 1. MÉTODOS DE PAGO ---
      // Incluye 'paypal' además de 'card'.
      // Stripe mostrará los disponibles según configuración y compatibilidad.
      payment_method_types: ['card', 'paypal'],

      // --- 2. LÍNEAS DE PEDIDO ---
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Pago único

      // --- 3. URLS DE REDIRECCIÓN ---
      success_url: `${siteUrl}/overview?payment=success`, // Redirige a /overview tras éxito
      cancel_url: `${siteUrl}/get-credits?status=canceled`, // Vuelve a /get-credits si cancela

      // --- 4. ID DE REFERENCIA (para tu webhook) ---
      client_reference_id: user.id, // Vincula la sesión al ID de usuario de Supabase

      // --- 5. EMAIL DEL CLIENTE (para prellenar) ---
      customer_email: user.email, // Facilita el pago al usuario

      // --- 6. HABILITAR CÓDIGOS PROMOCIONALES ---
      // Permite que el usuario introduzca códigos de descuento creados en Stripe
      allow_promotion_codes: true,

    });

    if (session.url) {
      console.log(`Stripe session created successfully: ${session.id}`);
      // Devuelve solo la URL al frontend
      return NextResponse.json({ url: session.url });
    } else {
      // Esto no debería ocurrir si la llamada a Stripe fue exitosa, pero por si acaso
      console.error("Stripe session created but no URL was returned.");
      return NextResponse.json({ error: 'Could not create Stripe session (no URL)' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Stripe session creation failed:", error.message || error);
    // Devuelve un error genérico al cliente, el detalle ya está logueado en el servidor
    return NextResponse.json({ error: `Failed to initiate payment. Please try again.` }, { status: 500 });
  }
}