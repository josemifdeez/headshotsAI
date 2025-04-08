// tailwind.config.js (COMPLETO Y CORREGIDO)

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  // Asegúrate de que estas rutas coincidan con la estructura de tu proyecto
	  "./pages/**/*.{ts,tsx}",
	  "./components/**/*.{ts,tsx}",
	  "./app/**/*.{ts,tsx}",
	  "./src/**/*.{ts,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: { // Tus definiciones de colores...
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: { // Tus definiciones de border radius...
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: { // Tus keyframes personalizados + spin
		  // --- AÑADIDO: Definición de keyframes para spin ---
		  spin: {
			to: {
			  transform: 'rotate(360deg)',
			},
		  },
		  // --- FIN AÑADIDO ---
				'accordion-down': { // Tu keyframe existente
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': { // Tu keyframe existente
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: { // Tus animaciones personalizadas + spin
		  // --- AÑADIDO: Definición de animación para spin ---
		  spin: 'spin 1s linear infinite',
		  // --- FIN AÑADIDO ---
				'accordion-down': 'accordion-down 0.2s ease-out', // Tu animación existente
				'accordion-up': 'accordion-up 0.2s ease-out'     // Tu animación existente
			},
			fontFamily: { // Tu definición de fuente personalizada
				euclid: [
					'Euclid Circular B',
					'sans-serif'
				]
			}
		}
	},
	plugins: [require("tailwindcss-animate")], // Tu plugin
  };