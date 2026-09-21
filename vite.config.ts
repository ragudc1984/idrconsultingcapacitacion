import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages sirve el sitio bajo la ruta del repositorio, no en la raiz. Con
// la base por defecto ("/") todos los assets del build dan 404 y la pagina
// queda en blanco sin ningun error en consola. El dev server, en cambio, si
// corre en la raiz, asi que la base solo se aplica al construir.
//
// VITE_BASE permite sobrescribirla sin tocar este archivo: lo necesita
// cualquier despliegue que no sea GitHub Pages, y tambien un fork con otro
// nombre de repositorio.
const BASE_EN_PRODUCCION = process.env.VITE_BASE ?? '/capacitacion-idr-consulting/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_EN_PRODUCCION : '/',
  plugins: [react(), tailwindcss()],
}))
