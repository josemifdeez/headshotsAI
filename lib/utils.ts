// ----- ARCHIVO: @/lib/utils.ts -----

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Tu función cn existente
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- AÑADIR ESTA FUNCIÓN ---
// Lee un ReadableStream (como request.body) y lo convierte en una cadena de texto
export async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read(); // Lee un trozo del stream
    if (done) break; // Si se acabó el stream, sal del bucle
    result += decoder.decode(value, { stream: true }); // Decodifica el trozo y añádelo al resultado
  }
  result += decoder.decode(); // Asegúrate de decodificar cualquier resto
  return result; // Devuelve la cadena completa
}
// --- FIN DE LA FUNCIÓN AÑADIDA ---

// Puedes tener otras funciones aquí si las necesitas...