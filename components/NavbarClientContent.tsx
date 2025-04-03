// components/NavbarClientContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AvatarIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
import { Database } from "@/types/supabase";
// Asegúrate que la ruta a ClientSideCredits es correcta si lo vuelves a usar
// import ClientSideCredits from "./realtime/ClientSideCredits";
import { cn } from "@/lib/utils";
import { User } from '@supabase/supabase-js';

// Define la interfaz de props que recibirá del Server Component
export interface CreditsRow {
    created_at: string;
    credits: number;
    id: number | string; // Ajusta según tu DB
    user_id: string;
}

interface NavbarClientContentProps {
    initialUser: User | null;
    initialCredits: CreditsRow | null;
    stripeIsConfigured: boolean;
}

export default function NavbarClientContent({ initialUser, initialCredits, stripeIsConfigured }: NavbarClientContentProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    // Estado local para usuario y créditos, inicializado con props del servidor
    // Esto permite actualizaciones en el cliente (ej: login/logout sin recarga)
    const [user, setUser] = useState<User | null>(initialUser);
    const [credits, setCredits] = useState<CreditsRow | null>(initialCredits);
    const supabase = createClientComponentClient<Database>(); // Cliente Supabase para el navegador

    // useEffect para detectar el scroll (igual que antes)
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll(); // Comprueba el estado inicial al cargar
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // useEffect para escuchar cambios de autenticación DESPUÉS de la carga inicial
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            // Actualiza el estado local del usuario
            setUser(currentUser);

            // Si el usuario cambia (login/logout), actualiza los créditos
            if (currentUser) {
                // Si es el mismo usuario que el inicial y ya teníamos créditos, podríamos evitar re-fetch
                // Pero para simplificar, re-obtenemos siempre que haya sesión en el cliente
                const { data: creditData, error: creditError } = await supabase
                    .from("credits").select("*").eq("user_id", currentUser.id).single();

                if (creditError && creditError.code !== 'PGRST116') { // PGRST116: No rows found, not an error here
                    console.error("Error fetching credits on auth change:", creditError.message);
                    setCredits(null);
                } else {
                    setCredits(creditData);
                }
            } else {
                // Si no hay usuario (logout), limpia los créditos
                setCredits(null);
            }
        });

        // Limpia la suscripción al desmontar el componente
        return () => {
            subscription?.unsubscribe();
        };
    // Añadimos supabase como dependencia por si la instancia cambiara, aunque es poco probable aquí
    }, [supabase]);

    // --- Definiciones de Links (Adaptadas para usar estado local 'user') ---
    const navLinksBase = [
        { href: "/#como-funciona", label: "¿Cómo funciona?" },
        { href: "/ejemplos", label: "Ejemplos" },
        { href: "/faq", label: "Preguntas Frecuentes" },
    ];
    const navLinksLoggedIn = [
        { href: "/overview", label: "Inicio" },
        ...navLinksBase,
        ...(stripeIsConfigured ? [{ href: "/get-credits", label: "Créditos" }] : []), // Podrías cambiar la etiqueta aquí si quieres
    ];
    const navLinksLoggedOut = [...navLinksBase];
    // Usamos el estado 'user' que puede actualizarse en el cliente
    const currentNavLinks = user ? navLinksLoggedIn : navLinksLoggedOut;


    // --- Render Links (Función adaptada, usa estado 'user' y 'isScrolled') ---
    const renderNavLinks = () => {
        const commonHoverClass = "hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200";

        if (!isScrolled) {
            const baseButtonClass = "text-gray-700";
            return (
                <>
                    {/* Usa el estado 'user' */}
                    {user && (<Link href="/overview"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Inicio</Button></Link>)}
                    <Link href="/#como-funciona"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>¿Cómo funciona?</Button></Link>
                    <Link href="/ejemplos"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Ejemplos</Button></Link>
                    <Link href="/faq"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Preguntas Frecuentes</Button></Link>
                    {/* Usa el estado 'user' */}
                    {user && stripeIsConfigured && (<Link href="/get-credits"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Consigue créditos</Button></Link>)}
                </>
            );
        }
        // Estado scrolleado (pill) - Usa currentNavLinks que depende del estado 'user'
        return (
            <>
                {currentNavLinks.map((link) => (
                    <Link href={link.href} key={link.href} passHref legacyBehavior>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm font-medium text-gray-600 hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200 px-3 py-1 rounded-md"
                        >
                            {link.label}
                        </Button>
                    </Link>
                ))}
            </>
        );
    };

    // --- CtaButton (Adaptado para usar estado local 'user') ---
    const CtaButton = () => (
        // Usa el estado 'user'
        <Link href={user ? "/overview" : "/login"} passHref>
            <Button
                size={"sm"}
                className={cn(
                    "group relative inline-flex items-center justify-center font-semibold tracking-wide text-white rounded-full shadow-md transition-all duration-300 ease-out",
                    "bg-gradient-to-r from-[#4C66FE] to-[#2539B0]",
                    "hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0]",
                    "active:scale-[0.97] active:shadow-[0_0_8px_4px_rgba(76,102,254,0.2)] active:from-[#4C66FE] active:to-[#2539B0]",
                    "px-5 py-2 text-sm"
                )}
            >
                Crear fotos
                <ArrowRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Button>
        </Link>
    );

    // --- Main JSX (Usa estados locales 'user', 'credits', 'isScrolled') ---
    // No necesitamos el estado 'isLoading' aquí porque los datos iniciales vienen del servidor
    // No necesitamos 'isClient' porque este componente *es* un client component ('use client')
    return (
        <nav
            className={cn(
                "w-full z-50",
                "lg:sticky lg:top-0",
                "transition-opacity duration-300 ease-in-out",
                // Lógica de opacidad para móvil al hacer scroll (si la quieres mantener)
                (isScrolled && typeof window !== 'undefined' && window.innerWidth < 1024) ? 'opacity-0 pointer-events-none' : 'opacity-100',
                 "lg:opacity-100 lg:pointer-events-auto", // Asegura visibilidad en desktop
                // Padding vertical basado en scroll
                isScrolled ? "lg:py-2" : "py-4"
            )}
        >
            <div
                className={cn(
                    "flex items-center mx-auto transition-all duration-300 ease-in-out",
                    "w-full px-4 lg:px-10 bg-transparent",
                    // Estilos de píldora en desktop al scrollear
                    isScrolled && [
                        "lg:max-w-7xl", "lg:bg-white/70", "lg:backdrop-blur-lg",
                        "lg:rounded-full", "lg:border", "lg:border-gray-200/70",
                        "lg:shadow-lg", "lg:px-4 sm:lg:px-5", "lg:h-14",
                    ]
                )}
            >
                {/* === Izquierda: Logo + Título === */}
                <div className={cn("flex items-center flex-shrink-0", isScrolled ? "lg:mr-4" : "mr-6 md:mr-10")}>
                    <Link href="/" className="flex items-center gap-3" aria-label="Ir a la página de inicio">
                        <Image src="/favicon-32x32.png" alt="Logo Sesiones Fotos IA" width={40} height={40} quality={100} priority /> {/* Añadido priority */}
                        <h2 className={cn("font-euclid font-bold text-lg md:text-2xl whitespace-nowrap", isScrolled && "lg:hidden")}>
                            Sesiones Fotos IA
                        </h2>
                    </Link>
                </div>

                {/* === Centro: Navegación (Desktop) === */}
                <div className={cn("hidden lg:flex flex-grow items-center justify-start", isScrolled ? "lg:gap-x-1.5" : "gap-4")}>
                    {renderNavLinks()} {/* Llama a la función que usa el estado local */}
                </div>

                {/* === Derecha: Acciones === */}
                <div className={cn("flex items-center flex-shrink-0 ml-auto", isScrolled ? "lg:gap-3" : "gap-3 md:gap-4")}>
                    {/* Ya no usamos isLoading, directamente comprobamos el estado 'user' */}
                    {user ? ( // --- Estado Logueado ---
                        <>
                            {/* Créditos (Usa estado local 'credits') */}
                            {stripeIsConfigured && credits && credits.credits !== undefined && ( // Verifica que credits exista y tenga la propiedad
                                <>
                                    {isScrolled && (
                                        <div className="hidden lg:flex text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 items-center gap-1">
                                            {/* Podrías mostrar un icono o texto simple aquí */}
                                            ⚡️ {credits.credits}
                                            {/* O reactivar ClientSideCredits si es necesario: */}
                                            {/* <ClientSideCredits creditsRow={credits} simple /> */}
                                        </div>
                                    )}
                                    {!isScrolled && (
                                        <span className='text-sm text-gray-700 font-medium hidden xl:inline'>Créditos: {credits.credits}</span>
                                    )}
                                </>
                            )}

                            {/* Avatar & Dropdown (Usa estado local 'user') */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                    <AvatarIcon height={isScrolled ? 24 : 28} width={isScrolled ? 24 : 28} className={cn("cursor-pointer transition-all text-blue-600 hover:text-blue-700", isScrolled && "lg:text-primary lg:hover:bg-indigo-100/80 lg:p-0.5 lg:rounded-full")} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mr-2 mt-2 lg:mr-10" align="end">
                                    <DropdownMenuLabel className="font-medium text-center text-gray-700 px-4 py-2 truncate">{user.email}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <Link href="/overview"><DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-primary text-sm py-1.5 px-3 transition-colors">Mi Panel</DropdownMenuItem></Link>
                                    {stripeIsConfigured && (<Link href="/get-credits"><DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-primary text-sm py-1.5 px-3 transition-colors">Conseguir Créditos</DropdownMenuItem></Link>)}
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <form action="/auth/sign-out" method="post"><DropdownMenuItem asChild><Button type="submit" variant="ghost" size="sm" className="w-full text-left justify-start cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-1.5 px-3 transition-colors">Cerrar sesión</Button></DropdownMenuItem></form>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Botón CTA */}
                            <CtaButton />
                        </>
                    ) : ( // --- Estado Deslogueado ---
                        <>
                            {/* Botón Iniciar sesión */}
                            <Link href="/login" className="hidden md:block">
                                <Button
                                    variant={"ghost"}
                                    size="sm"
                                    className={cn(
                                        'text-sm font-medium text-gray-600',
                                        'hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200',
                                        isScrolled && 'lg:px-3 lg:py-1 lg:rounded-md'
                                    )}
                                >
                                    Iniciar sesión
                                </Button>
                            </Link>

                            {/* Botón CTA */}
                            <CtaButton />
                        </>
                    )}
                </div>
                 {/* --- HAMBURGER REMOVED (igual que antes) --- */}
            </div>
        </nav>
    );
}