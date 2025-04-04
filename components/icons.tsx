// src/components/icons.tsx

import {
  Loader2, // Para spinner
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Cpu,
  ImageOff,
  Hourglass,
  Download,
  // Importa cualquier otro icono que puedas necesitar en otros lugares
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  spinner: Loader2,
  upload: Upload, // Añadido
  sparkles: Sparkles, // Añadido
  checkCircle: CheckCircle, // Añadido
  alertTriangle: AlertTriangle, // Añadido
  cpu: Cpu, // Añadido
  imageOff: ImageOff, // Añadido
  hourglass: Hourglass, // Añadido
  download: Download, // Añadido
  // Añade aquí otros iconos que uses en tu aplicación
};