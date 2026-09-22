/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Direccion base del API de tareas, fijada al construir la web. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
