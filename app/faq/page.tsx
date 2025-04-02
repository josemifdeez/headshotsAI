import { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Asegúrate que la ruta sea correcta

// --- OPTIMIZACIÓN SEO: Metadatos ---
export const metadata: Metadata = {
  title: 'Preguntas Frecuentes (FAQ) - Sesiones Fotos IA | Fotos Profesionales con IA',
  description: '¿Tienes dudas sobre cómo crear tus fotos profesionales con nuestra IA? Encuentra respuestas a las preguntas más comunes sobre Sesiones Fotos IA. ¡Resultados en minutos!',
  // Añade aquí otras metaetiquetas relevantes si lo necesitas (keywords, open graph, etc.)
  keywords: ['faq', 'preguntas frecuentes', 'fotos profesionales ia', 'inteligencia artificial', 'headshots ia', 'fotos currículum', 'sesiones fotos ia', 'cómo funciona', 'privacidad fotos ia'],
};

// --- Datos de las Preguntas Frecuentes ---
// Puedes mover esto a un archivo JSON o CMS si prefieres
const faqData = [
  {
    id: "faq-1",
    question: "¿Qué es Sesiones Fotos IA?",
    answer:
      "Sesiones Fotos IA es una plataforma que utiliza inteligencia artificial avanzada para transformar tus fotos caseras en retratos profesionales de alta calidad. Ideal para mejorar tu presencia en LinkedIn, currículums, portafolios y redes sociales.",
  },
  {
    id: "faq-2",
    question: "¿Cómo funciona el proceso?",
    answer:
      "Es simple: 1. Regístrate y elige un paquete. 2. Sube entre 10 y 20 fotos tuyas variadas (selfies, fotos de cara, diferentes ángulos y expresiones). 3. Nuestra IA analizará tus rasgos y generará nuevos retratos profesionales en diversos estilos basados en tus fotos originales. 4. Recibirás tus fotos generadas por IA en tu panel en cuestión de minutos u horas (dependiendo de la carga del servidor).",
  },
  {
    id: "faq-3",
    question: "¿Qué tipo de fotos debo subir?",
    answer:
      "Necesitamos fotos claras de tu rostro desde diferentes ángulos, con distintas expresiones faciales y en diversas condiciones de iluminación. Evita fotos con gafas de sol, sombreros que oculten la cara, fotos de grupo o imágenes de baja calidad. Cuanto mejor sea la calidad y variedad de las fotos que subas, mejores serán los resultados de la IA.",
  },
  {
    id: "faq-4",
    question: "¿Cuánto tiempo tarda en generar mis fotos?",
    answer:
      "El proceso de entrenamiento de la IA y generación de imágenes suele tardar entre 30 minutos y 2 horas. Te notificaremos por correo electrónico (si lo habilitas) cuando tus fotos profesionales estén listas en tu cuenta.",
  },
  {
    id: "faq-5",
    question: "¿Son realistas las fotos generadas por IA?",
    answer:
      "Sí, nuestra tecnología está diseñada para crear retratos muy realistas que mantienen tus rasgos distintivos. Ofrecemos diferentes estilos, algunos más fotorealistas que otros. Siempre buscamos un equilibrio entre calidad profesional y autenticidad.",
  },
  {
    id: "faq-6",
    question: "¿Qué pasa con mis fotos subidas? ¿Es seguro?",
    answer:
      "Tu privacidad y seguridad son nuestra máxima prioridad. Utilizamos tus fotos únicamente para entrenar el modelo de IA personalizado y generar tus retratos. Las fotos originales y el modelo entrenado se eliminan automáticamente de nuestros servidores después de un período corto (por ejemplo, 7 o 14 días) tras la generación de tus imágenes. Consulta nuestra Política de Privacidad para más detalles.",
  },
  {
    id: "faq-7",
    question: "¿En qué formatos recibiré mis fotos?",
    answer:
      "Recibirás tus fotos en formato digital de alta resolución (generalmente JPG o PNG), listas para usar en cualquier plataforma online o para imprimir si lo deseas.",
  },
  {
    id: "faq-8",
    question: "¿Puedo pedir estilos específicos?",
    answer:
      "Al comprar tu paquete, podrás ver y seleccionar entre una variedad de estilos predefinidos (ej. corporativo, casual, blanco y negro, creativo). La IA generará imágenes basadas en esos estilos utilizando tus fotos.",
  },
  {
    id: "faq-9",
    question: "¿Qué hago si no estoy satisfecho con los resultados?",
    answer:
      "Nuestro objetivo es tu satisfacción. Si los resultados no cumplen tus expectativas debido a un problema técnico o de calidad evidente por nuestra parte, por favor contacta con nuestro equipo de soporte a través de [tu email de soporte o enlace de contacto] para que podamos revisar tu caso. Asegúrate de haber seguido las guías sobre qué tipo de fotos subir para obtener los mejores resultados.",
  },
  // Añade más preguntas relevantes aquí
];

export default function FaqPage() {
  return (
    <div className="flex flex-col items-center pt-16 pb-16"> {/* Añadido pb-16 para espacio inferior */}
      <div className="flex flex-col gap-8 p-8 max-w-4xl w-full"> {/* Ajustado max-w para mejor lectura de FAQ */}
        <div className="text-center"> {/* Centrado el título */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Preguntas Frecuentes (FAQ)
          </h1>
          <p className="text-lg text-gray-600">
            Resolvemos tus dudas sobre Sesiones Fotos IA y cómo obtener tus retratos profesionales con inteligencia artificial.
          </p>
        </div>

        {/* --- Componente Accordion para las FAQs --- */}
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id}>
              <AccordionTrigger className="text-left text-lg hover:no-underline"> {/* Clase text-left añadida */}
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* --- Sección de Contacto Adicional (Opcional) --- */}
        <div className="mt-12 text-center border-t pt-8">
           <h2 className="text-2xl font-semibold mb-3">¿No encuentras tu respuesta?</h2>
           <p className="text-gray-600 mb-4">
             Si tienes alguna otra pregunta, no dudes en contactarnos.
           </p>
           {/* Cambia "/contacto" por tu ruta real de contacto o email */}
           {/* <Link href="/contacto">
             <Button variant="outline">Contactar con Soporte</Button>
           </Link> */}
           <p className="text-gray-800">Puedes escribirnos a: <a href="mailto:sesionesfotosia@gmail.com" className="text-blue-600 hover:underline">sesionesfotosia@gmail.com</a></p>
        </div>

      </div>
      {/* --- OPTIMIZACIÓN SEO: Structured Data (Schema Markup) --- */}
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          }) }}
        />
    </div>
  );
}