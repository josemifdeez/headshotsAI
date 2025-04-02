import { AvatarIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React from "react";
import { Database } from "@/types/supabase";
import ClientSideCredits from "./realtime/ClientSideCredits";

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
// packsIsEnabled no se usa en la navbar ahora, pero lo dejamos por si acaso
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
export const revalidate = 0;

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <nav className="flex w-full px-4 lg:px-10 py-4 items-center text-center gap-8 justify-start">
      {/* LOGO + TÍTULO */}
      <div className="flex items-center flex-shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/favicon-32x32.png"
            alt="Logo Sesiones Fotos IA"
            width={40}
            height={40}
            quality={100}
          />
          <h2 className="font-euclid font-bold text-lg md:text-2xl whitespace-nowrap">
            Sesiones Fotos IA
          </h2>
        </Link>
      </div>

      {/* NAVEGACIÓN PRINCIPAL (visible en pantallas grandes) */}
      <div className="hidden lg:flex flex-grow items-center gap-4">
         {/* MOVED & CONDITIONAL: Link Inicio solo si está logueado, ahora al principio */}
         {user && (
            <Link href="/overview">
              <Button variant={"ghost"}>Inicio</Button>
            </Link>
         )}

        {/* Links visibles siempre */}
        <Link href="/#como-funciona">
          <Button variant={"ghost"}>¿Cómo funciona?</Button>
        </Link>
        <Link href="/ejemplos">
          <Button variant={"ghost"}>Ejemplos</Button>
        </Link>
        <Link href="/faq">
          <Button variant={"ghost"}>Preguntas Frecuentes</Button>
        </Link>

        {/* Otros links solo si el usuario está logueado (Packs eliminado) */}
        {user && (
          <>
            {/* Link 'Consigue créditos' si Stripe está configurado */}
            {stripeIsConfigured && (
              <Link href="/get-credits">
                <Button variant={"ghost"}>Consigue créditos</Button>
              </Link>
            )}
            {/* Ya no se muestra 'Packs' aquí */}
          </>
        )}
      </div>

      {/* SECCIÓN DERECHA: (Avatar + Crear Fotos) O (Login + Crear Fotos) */}
      <div className="flex gap-3 md:gap-4 items-center ml-auto flex-shrink-0">

        {/* --- ESTADO LOGUEADO --- */}
        {user && (
            <>
                 {/* Créditos (Opcional, si Stripe está configurado) */}
                 {stripeIsConfigured && (
                     <ClientSideCredits creditsRow={credits ? credits : null} />
                 )}

                 {/* Avatar y Menú de Usuario */}
                 <DropdownMenu>
                     <DropdownMenuTrigger asChild className="cursor-pointer">
                        {/* Se usa el AvatarIcon como icono de usuario */}
                        <AvatarIcon height={28} width={28} className="text-blue-600 hover:text-blue-700 cursor-pointer"/>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent className="w-56 mr-4 lg:mr-10">
                         <DropdownMenuLabel className="text-primary text-center overflow-hidden text-ellipsis">
                           {user.email}
                         </DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         {/* Links específicos del usuario en el dropdown */}
                         <Link href="/overview">
                           <DropdownMenuItem className="cursor-pointer">Inicio</DropdownMenuItem>
                         </Link>
                         {/* Packs ya no se incluye aquí tampoco */}
                         {stripeIsConfigured && (
                           <Link href="/get-credits">
                             <DropdownMenuItem className="cursor-pointer">Consigue créditos</DropdownMenuItem>
                           </Link>
                         )}
                         {/* Podrías añadir links a 'Mi cuenta', 'Ajustes', etc. */}
                         <DropdownMenuSeparator />
                         {/* Botón Cerrar Sesión */}
                         <form action="/auth/sign-out" method="post">
                           <DropdownMenuItem asChild>
                              <Button
                                type="submit"
                                className="w-full text-left justify-start cursor-pointer"
                                variant={"ghost"}
                              >
                                Cerrar sesión
                              </Button>
                           </DropdownMenuItem>
                         </form>
                     </DropdownMenuContent>
                 </DropdownMenu>

                 {/* Botón Crear Fotos (cuando está logueado) */}
                 <Link href="/overview"> {/* O a la página específica de creación */}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                        Crear fotos
                        <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                 </Link>
            </>
        )}

        {/* --- ESTADO DESCONECTADO --- */}
        {!user && (
            <>
                {/* Botón Iniciar Sesión (solo si no está logueado) */}
                <Link href="/login" className="hidden md:block">
                    <Button variant={"ghost"}>Iniciar sesión</Button>
                </Link>

                {/* Botón Crear Fotos (cuando está desconectado) */}
                <Link href="/login"> {/* Lleva a login si no está conectado */}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                        Crear fotos
                        <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                </Link>
            </>
        )}
      </div>
    </nav>
  );
}