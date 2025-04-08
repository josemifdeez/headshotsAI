// components/NavbarClientContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { AvatarIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Coins } from 'lucide-react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"; // Asegúrate que estos imports son correctos
import Link from "next/link";
import { Button } from "./ui/button";
import { Database } from "@/types/supabase"; // Asegúrate que el path es correcto
import { cn } from "@/lib/utils"; // Asegúrate que el path es correcto
import { User } from '@supabase/supabase-js';

// Define la interfaz para la fila de créditos si no está ya en "@/types/supabase"
export interface CreditsRow {
    created_at: string;
    credits: number;
    id: number | string;
    user_id: string;
}
interface NavbarClientContentProps {
    initialUser: User | null;
    initialCredits: CreditsRow | null;
    stripeIsConfigured: boolean;
}

export default function NavbarClientContent({ initialUser, initialCredits, stripeIsConfigured }: NavbarClientContentProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser);
    const [credits, setCredits] = useState<CreditsRow | null>(initialCredits);
    const supabase = createClientComponentClient<Database>();

    // Efecto para detectar el scroll
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll(); // Estado inicial al montar
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Efecto para manejar cambios de autenticación y créditos
    useEffect(() => {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data: creditData, error: creditError } = await supabase
                    .from("credits").select("*").eq("user_id", currentUser.id).single();
                if (creditError && creditError.code !== 'PGRST116') {
                    console.error("Error fetching credits on auth change:", creditError.message);
                    setCredits(null);
                } else {
                    setCredits(creditData);
                }
            } else {
                setCredits(null);
            }
        });

        let creditsChannel: ReturnType<typeof supabase.channel> | null = null;
        if (user?.id) {
            creditsChannel = supabase
                .channel(`public:credits:user_id=eq.${user.id}`)
                .on<CreditsRow>(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'credits', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        console.log('Credit change received!', payload);
                        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                            if (payload.new && 'credits' in payload.new) {
                                setCredits(payload.new as CreditsRow);
                            }
                        } else if (payload.eventType === 'DELETE') {
                            if (payload.old && 'id' in payload.old && credits?.id === payload.old.id) {
                                setCredits(null);
                            }
                        }
                    }
                )
                .subscribe((status, err) => {
                     if (status === 'SUBSCRIBED') {
                        console.log(`Subscribed to credits channel for user ${user.id}`);
                     } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                         console.error(`Credits channel subscription status: ${status}`, err || '');
                     }
                     if (err) {
                        console.error('Error subscribing to credits channel:', err);
                     }
                });
        }

        return () => {
            if (authSubscription) { authSubscription.unsubscribe(); }
            if (creditsChannel) { supabase.removeChannel(creditsChannel).catch(err => console.error("Error removing channel", err)); }
        };
    }, [supabase, user?.id]);

    // --- LÓGICA DE ENLACES CORREGIDA ---
    const navLinksBase = [
        { href: "/#como-funciona", label: "¿Cómo funciona?" },
        { href: "/ejemplos", label: "Ejemplos" },
        { href: "/faq", label: "Preguntas Frecuentes" },
    ];
    const navLinksLoggedIn = [ // Solo enlaces para usuarios logueados
        { href: "/overview", label: "Inicio" },
        ...(stripeIsConfigured ? [{ href: "/get-credits", label: "Conseguir créditos" }] : []),
    ];
    const navLinksLoggedOut = [...navLinksBase]; // Enlaces para no logueados
    // --- FIN DE CORRECCIÓN ---

    // Función para renderizar los enlaces (usa la lógica ternaria correcta)
    const renderNavLinks = () => {
        const linksToRender = user ? navLinksLoggedIn : navLinksLoggedOut;
        const linkStyle = isScrolled ? "text-sm font-medium text-gray-600 hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200 px-3 py-1 rounded-md" : "text-gray-700 hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200";
        const buttonSize = isScrolled ? "sm" : "default";
        return (<> {linksToRender.map((link) => (<Link href={link.href} key={link.href} passHref legacyBehavior><Button variant="ghost" size={buttonSize} className={cn(linkStyle)}>{link.label}</Button></Link>))} </>);
    };

    // Botón CTA (con lógica de href y texto correctos)
    const CtaButton = () => (
        <Link href={user ? "/overview" : "/login"} passHref>
            <Button
                size={"sm"}
                className={cn(
                    "group relative inline-flex items-center justify-center font-semibold tracking-wide text-white rounded-full shadow-md transition-all duration-300 ease-out",
                    "bg-gradient-to-r from-[#4C66FE] to-[#2539B0]",
                    "hover:shadow-[0_0_15px_5px_rgba(76,102,254,0.25)] hover:from-[#5C76FF] hover:to-[#3A4CC0]",
                    "active:scale-[0.97] active:shadow-[0_0_8px_4px_rgba(76,102,254,0.2)] active:from-[#4C66FE] active:to-[#2539B0]",
                    "px-2 sm:px-5 py-2 text-sm",
                    "flex-shrink min-w-0"
                )}
            >
                {user ? "Ir a mi Panel" : "Crear fotos"}
                <ArrowRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 flex-shrink-0" />
            </Button>
        </Link>
    );

    // Avatar
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const avatarSize = isScrolled ? 28 : 32;

    return (
        <nav className={cn(
            "w-full z-50 lg:sticky lg:top-0 transition-all duration-300 ease-in-out", // Mantenemos la transición general de la barra
            isScrolled ? "lg:py-2" : "py-4"
        )}>
            <div className={cn(
                 "flex items-center mx-auto transition-all duration-300 ease-in-out w-full", // Mantenemos la transición del contenedor interno
                 "px-3 sm:px-4 lg:px-10 bg-transparent",
                 isScrolled && [
                    "lg:max-w-7xl",
                    "lg:bg-white/70 lg:backdrop-blur-lg",
                    "lg:rounded-full lg:border",
                    "lg:border-gray-200/70 lg:shadow-lg",
                    "lg:px-4 sm:lg:px-5",
                    "lg:h-14"
                 ]
            )}>
                {/* --- Contenedor Izquierda (Logo) --- */}
                <div className={cn(
                    "flex items-center flex-shrink-0",
                    // Mantenemos la transición del margen si es deseado
                    "transition-all duration-300 ease-in-out", // O quitar esta línea si tampoco quieres que el margen se anime
                    isScrolled ? "mr-1 sm:mr-3 lg:mr-4" : "mr-1 sm:mr-3 lg:mr-10"
                )}>
                    <Link href="/" className="flex items-center" aria-label="Ir a la página de inicio">
                       {/* Logo Principal SIN TRANSICIÓN */}
                       <Image
                           src="/logo.png"
                           alt="Logo Sesiones Fotos IA"
                           width={10977}
                           height={1516}
                           quality={95}
                           priority={!isScrolled}
                           className={cn(
                               "h-auto w-44 sm:w-60 object-contain", // <-- Eliminada transition-all duration-300 ease-in-out
                               !isScrolled && "lg:h-10 lg:w-auto",
                               isScrolled && "lg:hidden"
                           )}
                        />
                       {/* Logo Mini */}
                       <Image
                           src="/logomini.png"
                           alt="Logo Mini Sesiones Fotos IA"
                           width={40}
                           height={40}
                           quality={90}
                           className={cn(
                               "h-10 w-10 object-contain hidden",
                               isScrolled && "lg:block" // Este aparece instantáneamente al hacer scroll en LG
                           )}
                       />
                    </Link>
                </div>

                {/* --- Contenedor Centro (Navegación Desktop) --- */}
                <div className={cn(
                    "hidden lg:flex flex-grow items-center justify-start",
                    // Mantenemos la transición del espaciado si es deseado
                    "transition-all duration-300 ease-in-out",
                    isScrolled ? "lg:gap-x-1.5" : "gap-4"
                )}>
                    {renderNavLinks()} {/* Renderizará los enlaces correctos */}
                </div>

                {/* --- Contenedor Derecha (Acciones) --- */}
                <div className={cn(
                    "relative flex items-center flex-shrink-0 ml-auto",
                    "gap-2 sm:gap-3"
                )}>
                    {user ? ( // --- Usuario Logueado ---
                        <>
                           {/* --- Créditos --- */}
                           {stripeIsConfigured && (
                                <div className={cn(
                                    "flex items-center gap-1 text-sm font-medium mr-1 transition-all duration-300", // Mantenemos transición aquí
                                    isScrolled ? "text-gray-600 border border-gray-200/80 rounded-full px-2 py-0.5 text-xs bg-white/50" : "text-gray-700 px-1"
                                )}>
                                    <Coins className={cn("w-4 h-4 text-[#4C66FE]", isScrolled && "w-3.5 h-3.5")} strokeWidth={2}/>
                                    <span className={cn( 'hidden', !isScrolled && 'lg:inline ml-1 mr-0.5' )}>Créditos:</span>
                                    <span>{credits?.credits ?? 0}</span>
                                </div>
                           )}

                            {/* --- Menú Desplegable Usuario (con modal=false) --- */}
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                    <span className="inline-flex items-center justify-center flex-shrink-0" title={user.email || 'Menú de usuario'}>
                                        {avatarUrl ? (
                                            <Image src={avatarUrl} alt={user.email || 'Avatar'} width={avatarSize} height={avatarSize} className={cn("rounded-full cursor-pointer transition-all object-cover border border-gray-200", isScrolled && "lg:hover:ring-2 lg:hover:ring-indigo-200/80 lg:hover:ring-offset-1")} referrerPolicy="no-referrer"/>
                                        ) : (
                                            <AvatarIcon height={avatarSize} width={avatarSize} className={cn("cursor-pointer transition-all text-blue-600 hover:text-blue-700", isScrolled && "lg:text-primary lg:hover:bg-indigo-100/80 lg:p-0.5 lg:rounded-full")}/>
                                        )}
                                    </span>
                                </DropdownMenuTrigger>

                                {/* --- Contenido del Menú --- */}
                                <DropdownMenuContent
                                    className="w-56 mr-2 mt-2 lg:mr-10"
                                    align="end"
                                    // sticky="partial" // Mantener comentado/eliminado o probar después
                                    sideOffset={isScrolled ? 8 : 4}
                                >
                                    <DropdownMenuLabel className="font-medium text-center text-gray-700 px-4 py-2 truncate">{user.email}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <Link href="/overview" passHref legacyBehavior><DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-primary text-sm py-1.5 px-3 transition-colors">Mi Panel</DropdownMenuItem></Link>
                                    {stripeIsConfigured && (<Link href="/get-credits" passHref legacyBehavior><DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-primary text-sm py-1.5 px-3 transition-colors">Conseguir Créditos</DropdownMenuItem></Link>)}
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    {/* --- Formulario Cerrar Sesión --- */}
                                    <form action="/auth/sign-out" method="post">
                                        <DropdownMenuItem asChild>
                                            <Button type="submit" variant="ghost" size="sm" className="w-full text-left justify-start cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-1.5 px-3 transition-colors">
                                                Cerrar sesión
                                            </Button>
                                        </DropdownMenuItem>
                                    </form>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : ( // --- Usuario Deslogueado ---
                        <>
                            {/* Botón Iniciar Sesión (solo si no está logueado) */}
                            <Link href="/login" className="hidden md:block flex-shrink-0">
                                <Button variant={"ghost"} size="sm" className={cn('text-sm font-medium text-gray-600 hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200', isScrolled && 'lg:px-3 lg:py-1 lg:rounded-md')}>
                                    Iniciar sesión
                                </Button>
                            </Link>
                            {/* Botón CTA */}
                            <CtaButton />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}