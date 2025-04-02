/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https', // El protocolo que usa la URL
        hostname: 'placehold.co', // El dominio que quieres permitir
        port: '', // Déjalo vacío si no hay puerto específico
        pathname: '/**', // Permite cualquier ruta dentro de ese dominio (/**)
      },
      // Puedes añadir más objetos aquí para otros dominios si los necesitas
      // Ejemplo: { protocol: 'https', hostname: 'otra-cdn.com', ... }
    ],
  },
};

module.exports = nextConfig;
