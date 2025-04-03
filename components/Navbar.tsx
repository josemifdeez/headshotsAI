// components/Navbar.tsx (O tu ruta correcta)
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import React from "react";
import { Database } from "@/types/supabase";
// Importa el componente cliente que acabamos de crear
import NavbarClientContent, { CreditsRow } from "./NavbarClientContent"; // Asegúrate que la ruta sea correcta
import { User } from "@supabase/supabase-js";

// Habilita el dynamic rendering para asegurar que las cookies se lean correctamente en cada request
// y la información de sesión esté actualizada en el servidor.
// Opcional: si usas layout/page con 'force-dynamic', esto podría no ser necesario aquí.
export const dynamic = "force-dynamic";

// Puedes mantener la revalidación si es necesaria para otros datos, aunque dynamic la sobrescribe.
// export const revalidate = 0;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export default async function Navbar() {
    const supabase = createServerComponentClient<Database>({ cookies });

    // 1. Obtener datos del usuario en el servidor
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 2. Obtener créditos en el servidor SI hay usuario
    let credits: CreditsRow | null = null;
    if (user) {
        const { data: creditData, error: creditError } = await supabase
            .from("credits")
            .select("*")
            .eq("user_id", user.id) // No necesitas ?? "" porque ya comprobamos 'user'
            .single();

        // Solo asignamos si no hay error o el error es que no existe la fila (PGRST116)
        if (!creditError || creditError.code === 'PGRST116') {
             credits = creditData; // Será null si no hay fila, lo cual está bien
        } else {
            console.error("Server Component - Error fetching credits:", creditError.message);
            // Decide cómo manejar el error, aquí simplemente no pasamos créditos
        }
    }

    // 3. Renderizar el Componente Cliente pasándole los datos iniciales como props
    return (
        <NavbarClientContent
            initialUser={user} // Pasa el usuario (o null)
            initialCredits={credits} // Pasa los créditos (o null)
            stripeIsConfigured={stripeIsConfigured} // Pasa la configuración de Stripe
        />
    );
}