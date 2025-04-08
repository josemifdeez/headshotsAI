// src/app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

// --- !!! CONFIGURACIÓN DE SEGURIDAD ESENCIAL !!! ---
// ACTUALIZADO: Se añadió el dominio específico de AWS S3 donde se alojan las imágenes.
// ¡Asegúrate de que este sea el único dominio necesario o añade otros si Astria los usa!
const ALLOWED_IMAGE_ORIGINS: string[] = [
  'sdbooth2-production.s3.amazonaws.com', // <-- Dominio correcto de AWS S3
  // 'images.astria.ai', // Puedes dejarlo si Astria también usa este dominio a veces, o quitarlo si no.
];

// Opcional: Carga la clave API de Astria desde .env si fuera necesaria (probablemente no para descargar)
// const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  // Decodifica el nombre de archivo que viene del cliente
  const filename = decodeURIComponent(searchParams.get('filename') || 'downloaded-image.png');

  // --- 1. Validación de Entrada ---
  if (!imageUrl) {
    console.warn("[Image Proxy] Rechazado: Falta el parámetro 'url'");
    return new NextResponse(JSON.stringify({ error: 'Missing image URL parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch (error) {
    console.warn(`[Image Proxy] Rechazado: Formato de URL inválido: ${imageUrl}`);
    return new NextResponse(JSON.stringify({ error: 'Invalid image URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- 2. Validación de Seguridad CRÍTICA (Prevención SSRF) ---
  // Comprueba si el hostname extraído de la URL está en nuestra lista blanca
  if (!ALLOWED_IMAGE_ORIGINS.includes(parsedUrl.hostname)) {
    console.warn(`[Image Proxy] Bloqueado (SSRF): Dominio no permitido: ${parsedUrl.hostname}. URL solicitada: ${imageUrl}`);
    return new NextResponse(JSON.stringify({ error: 'Access to this image domain is forbidden' }), {
      status: 403, // Forbidden
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Si la validación pasa, logueamos e intentamos el fetch
  console.log(`[Image Proxy] Permitido: Iniciando fetch para dominio ${parsedUrl.hostname}. URL: ${imageUrl}`);

  try {
    // --- 3. Fetch desde el Servidor a la URL de la Imagen (Astria/S3) ---
    const fetchHeaders: HeadersInit = {
      // Podrías añadir un User-Agent si quieres, pero usualmente no es necesario
      // 'User-Agent': 'MiAppImageProxy/1.0 (+https://tu-dominio.com)',
    };
    // La autenticación probablemente no es necesaria aquí para URLs firmadas de S3
    // if (ASTRIA_API_KEY) { fetchHeaders['Authorization'] = `Bearer ${ASTRIA_API_KEY}`; }

    const imageResponse = await fetch(imageUrl, { // Usa la URL completa con firma
      method: 'GET',
      headers: fetchHeaders,
      redirect: 'follow', // Importante seguir redirecciones si S3/Astria las usa
      cache: 'no-store', // Esencial: No cachear respuestas potencialmente firmadas/temporales en el proxy
    });

    // --- 4. Manejo de Errores de la Respuesta del Origen (S3/Astria) ---
    if (!imageResponse.ok) {
      // Si el origen devuelve un error (ej: 403 por firma expirada, 404 no encontrado)
      let errorDetails = '';
      try {
        // Intenta leer el cuerpo del error (S3 a veces devuelve XML con detalles)
        const errorText = await imageResponse.text();
        errorDetails = errorText.substring(0, 300); // Limita la longitud
      } catch (_) {} // Ignora si no se puede leer el cuerpo
      console.error(`[Image Proxy] Error al hacer fetch desde el origen [${imageUrl}]: ${imageResponse.status} ${imageResponse.statusText}. Detalles: ${errorDetails}`);
      // Devuelve un error al cliente, propagando el status code del origen
      return new NextResponse(
        JSON.stringify({ error: `Failed to fetch image from origin server: ${imageResponse.statusText}` }),
        { status: imageResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // --- 5. Preparar y Enviar la Respuesta al Navegador del Usuario ---
    const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream'; // Tipo de archivo
    const contentLength = imageResponse.headers.get('content-length'); // Tamaño (opcional)

    // Construir las cabeceras para la respuesta al navegador
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      // Fuerza la descarga con el nombre de archivo proporcionado
      'Content-Disposition': `attachment; filename="${filename}"`,
      // Instrucciones estrictas de no cachear para el navegador
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Opcional: Previene que la respuesta sea interpretada como algo distinto (ej: HTML)
      'X-Content-Type-Options': 'nosniff',
    });
    // Añadir Content-Length si está disponible (ayuda al navegador a mostrar progreso)
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    console.log(`[Image Proxy] Éxito: Enviando imagen '${filename}' (${contentType}) al cliente desde ${imageUrl}`);

    // Devolver la respuesta: status 200, el cuerpo de la imagen (stream), y las cabeceras
    return new NextResponse(imageResponse.body, {
      status: 200,
      statusText: 'OK',
      headers: responseHeaders,
    });

  } catch (error: unknown) {
    // --- Manejo de Errores Inesperados del Proxy Mismo ---
    console.error(`[Image Proxy] Error interno del proxy procesando [${imageUrl}]:`, error);
    let errorMessage = 'Internal Server Error in image proxy';
    if (error instanceof Error) {
        // En desarrollo podrías querer más detalles, pero en producción sé cauto
        errorMessage = `${errorMessage}: ${error.message}`;
    }
    // Devuelve un error 500 genérico al cliente
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}