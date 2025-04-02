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
} from "./ui/dropdown-menu"; // Ensure path is correct
import Link from "next/link";
import { Button } from "./ui/button"; // Ensure path is correct
import { Database } from "@/types/supabase";
import ClientSideCredits from "./realtime/ClientSideCredits"; // Ensure path is correct
import { cn } from "@/lib/utils";
import { User } from '@supabase/supabase-js';

// Interface CreditsRow (no changes)
export interface CreditsRow {
    created_at: string;
    credits: number;
    id: number; // Or string
    user_id: string;
}

export default function NavbarInteractive() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [credits, setCredits] = useState<CreditsRow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false); // State to track client-side rendering
    const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

    // useEffect for scroll detection
    useEffect(() => {
        if (typeof window === 'undefined') return;
        setIsClient(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // useEffect for auth/data fetching (no significant changes)
    useEffect(() => {
        const supabase = createClientComponentClient<Database>();
        let isMounted = true;
        setIsLoading(true); // Start loading immediately

        const fetchData = async () => {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (!isMounted) return;
            if (authError) { console.error("Auth error:", authError.message); setUser(null); setCredits(null); setIsLoading(false); return; }

            setUser(authUser);
            if (authUser) {
                const { data: creditData, error: creditError } = await supabase
                    .from("credits").select("*").eq("user_id", authUser.id).single();
                 if (!isMounted) return;
                if (creditError && creditError.code !== 'PGRST116') { console.error("Error fetching credits:", creditError.message); setCredits(null); }
                else { setCredits(creditData); }
            } else { setCredits(null); }
             if (isMounted) setIsLoading(false);
        };
        fetchData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            const authUser = session?.user ?? null;
            const userChanged = user?.id !== authUser?.id;
            if (userChanged) setIsLoading(true);
            setUser(authUser);
            if (!authUser) { setCredits(null); if (isMounted) setIsLoading(false); }
            else {
                if (userChanged || !credits) {
                    const { data: creditData, error: creditError } = await supabase.from("credits").select("*").eq("user_id", authUser.id).single();
                    if (!isMounted) return;
                     if (creditError && creditError.code !== 'PGRST116') { console.error("Error fetching credits on auth change:", creditError.message); setCredits(null); }
                    else { setCredits(creditData); }
                }
                 if (isMounted) setIsLoading(false);
            }
        });
        return () => { isMounted = false; subscription?.unsubscribe(); };
    }, []);


      // --- Link Definitions (no changes) ---
      const navLinksBase = [
        { href: "/#como-funciona", label: "¿Cómo funciona?" },
        { href: "/ejemplos", label: "Ejemplos" },
        { href: "/faq", label: "Preguntas Frecuentes" },
      ];
      const navLinksLoggedIn = [
        { href: "/overview", label: "Inicio" },
        ...navLinksBase,
        ...(stripeIsConfigured ? [{ href: "/get-credits", label: "Créditos" }] : []),
      ];
      const navLinksLoggedOut = [...navLinksBase];
      const currentNavLinks = user ? navLinksLoggedIn : navLinksLoggedOut;

      // --- Render Links (Desktop Only - HOVER EFFECT CHANGED) ---
      const renderNavLinks = () => {
          const commonHoverClass = "hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200"; // Define common hover style

          // Estado superior (!isScrolled)
          if (!isScrolled) {
              const baseButtonClass = "text-gray-700"; // Base text color for top state links
              return (
                 <>
                    {user && (<Link href="/overview"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Inicio</Button></Link>)}
                    <Link href="/#como-funciona"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>¿Cómo funciona?</Button></Link>
                    <Link href="/ejemplos"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Ejemplos</Button></Link>
                    <Link href="/faq"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Preguntas Frecuentes</Button></Link>
                    {user && stripeIsConfigured && (<Link href="/get-credits"><Button variant={"ghost"} className={cn(baseButtonClass, commonHoverClass)}>Consigue créditos</Button></Link>)}
                 </>
              );
          }
           // Estado scrolleado (pill)
          return (
            <>
              {currentNavLinks.map((link) => (
                <Link href={link.href} key={link.href} passHref legacyBehavior>
                    <Button
                        variant="ghost"
                        size="sm"
                        // Apply specific base text color and the common hover effect, remove old background hover
                        className="text-sm font-medium text-gray-600 hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200 px-3 py-1 rounded-md"
                    >
                        {link.label}
                    </Button>
                </Link>
              ))}
            </>
          );
      };

       // --- CtaButton (Unchanged) ---
       const CtaButton = () => (
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

   // --- Loading Placeholder (no changes) ---
   if (isLoading && !isClient) {
     return (
        <div className="w-full py-4 h-[72px]">
           <div className="w-full h-full flex items-center justify-between px-4 lg:px-10 bg-gray-100">
               <div className="flex items-center flex-shrink-0 gap-3 mr-6 md:mr-10">
                  <div className="h-10 w-10 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-7 w-40 bg-gray-300 rounded animate-pulse"></div>
               </div>
               <div className="flex items-center flex-shrink-0 gap-3 md:gap-4 ml-auto">
                  <div className="h-9 w-28 bg-gray-300 rounded-full animate-pulse"></div>
               </div>
           </div>
        </div>
     );
   }


    // --- Main JSX ---
    return (
        <nav
            className={cn(
                "w-full z-50",
                "lg:sticky lg:top-0",
                "transition-opacity duration-300 ease-in-out",
                (isScrolled && isClient && window.innerWidth < 1024) ? 'opacity-0 pointer-events-none' : 'opacity-100',
                "lg:opacity-100 lg:pointer-events-auto",
                 // Vertical Padding
                isScrolled ? "lg:py-2" : "py-4"
            )}
        >
            <div
                className={cn(
                    "flex items-center mx-auto transition-all duration-300 ease-in-out",
                    // Base Style
                    "w-full px-4 lg:px-10 bg-transparent",
                    // Desktop Scrolled (Pill) Styles
                    isScrolled && [
                        "lg:max-w-7xl", "lg:bg-white/70", "lg:backdrop-blur-lg",
                        "lg:rounded-full", "lg:border", "lg:border-gray-200/70",
                        "lg:shadow-lg", "lg:px-4 sm:lg:px-5", "lg:h-14",
                    ]
                )}
            >
                {/* === Left Column: Logo + Title (no changes) === */}
                <div className={cn("flex items-center flex-shrink-0", isScrolled ? "lg:mr-4" : "mr-6 md:mr-10")}>
                    <Link href="/" className="flex items-center gap-3" aria-label="Ir a la página de inicio">
                        <Image src="/favicon-32x32.png" alt="Logo Sesiones Fotos IA" width={40} height={40} quality={100}/>
                        <h2 className={cn("font-euclid font-bold text-lg md:text-2xl whitespace-nowrap", isScrolled && "lg:hidden")}>
                            Sesiones Fotos IA
                        </h2>
                    </Link>
                </div>

                {/* === Center Column: Navigation (Desktop Only) === */}
                <div className={cn("hidden lg:flex flex-grow items-center justify-start", isScrolled ? "lg:gap-x-1.5" : "gap-4")}>
                    {renderNavLinks()} {/* Links now have updated hover */}
                </div>

                {/* === Right Column: Actions === */}
                <div className={cn("flex items-center flex-shrink-0 ml-auto", isScrolled ? "lg:gap-3" : "gap-3 md:gap-4")}>
                    {isLoading ? (
                       <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-7 w-7 bg-gray-300 rounded-full animate-pulse hidden lg:block"></div>
                            <div className="h-9 w-28 bg-gray-300 rounded-full animate-pulse"></div>
                       </div>
                    ) : user ? ( // --- Logged In State ---
                        <>
                           {/* Credits (no changes) */}
                           {stripeIsConfigured && credits && (
                               <>
                                {isScrolled && (
                                   <div className="hidden lg:flex text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 items-center gap-1">
                                       ⚡️ <ClientSideCredits creditsRow={credits} simple />
                                   </div>
                                )}
                                {!isScrolled && (
                                   <span className='text-sm text-gray-700 font-medium hidden xl:inline'>Créditos: {credits.credits}</span>
                                )}
                               </>
                           )}

                           {/* Avatar & Dropdown (no changes) */}
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                   <AvatarIcon height={isScrolled ? 24 : 28} width={isScrolled ? 24 : 28} className={cn("cursor-pointer transition-all text-blue-600 hover:text-blue-700", isScrolled && "lg:text-primary lg:hover:bg-indigo-100/80 lg:p-0.5 lg:rounded-full")}/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mr-2 mt-2 lg:mr-10" align="end">
                                    <DropdownMenuLabel className="font-medium text-center text-gray-700 px-4 py-2 truncate">{user.email}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <Link href="/overview"><DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-primary text-sm py-1.5 px-3 transition-colors">Mi Panel</DropdownMenuItem></Link>
                                    {stripeIsConfigured && (<Link href="/get-credits"><DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-primary text-sm py-1.5 px-3 transition-colors">Conseguir Créditos</DropdownMenuItem></Link>)}
                                    <DropdownMenuSeparator className="bg-gray-100"/>
                                    <form action="/auth/sign-out" method="post"><DropdownMenuItem asChild><Button type="submit" variant="ghost" size="sm" className="w-full text-left justify-start cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-1.5 px-3 transition-colors">Cerrar sesión</Button></DropdownMenuItem></form>
                                </DropdownMenuContent>
                           </DropdownMenu>

                           {/* CTA Button */}
                           <CtaButton />
                        </>
                    ) : ( // --- Logged Out State ---
                        <>
                            {/* Login Button (HOVER EFFECT CHANGED) */}
                            <Link href="/login" className="hidden md:block">
                                {/* Apply same hover effect as nav links */}
                                <Button
                                    variant={"ghost"}
                                    size="sm"
                                    className={cn(
                                        // Base style for mobile/desktop top state
                                        'text-sm font-medium text-gray-600',
                                        // Common hover effect for text color change, no background change
                                        'hover:bg-transparent hover:text-[#4C66FE] transition-colors duration-200',
                                        // Specific overrides for desktop scrolled (pill) state if needed (like padding/rounding), but hover is handled above
                                        isScrolled && 'lg:px-3 lg:py-1 lg:rounded-md'
                                    )}
                                >
                                     Iniciar sesión
                                 </Button>
                            </Link>

                           {/* CTA Button */}
                           <CtaButton />
                        </>
                    )}
                </div>
                {/* --- HAMBURGER REMOVED --- */}
            </div>
        </nav>
    );
}