/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },

  images: {
    remotePatterns: [
      // Mantienes la configuración que ya tenías para placehold.co
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // ----- AÑADES ESTA NUEVA CONFIGURACIÓN -----
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // El dominio de las imágenes de Google
        port: '', // Puerto estándar para https
        pathname: '/a/**', // Permite rutas como /a/ACg8oc... (común para avatares)
                          // Alternativamente, puedes usar '/**' si quieres permitir cualquier ruta
      },
      // -------------------------------------------
      // Puedes añadir más objetos aquí para otros dominios si los necesitas
    ],
  },
};

module.exports = nextConfig;