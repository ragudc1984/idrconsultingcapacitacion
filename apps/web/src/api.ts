import type { Task } from '@idr/shared'

/**
 * Cliente del API de tareas. La direccion base se fija al construir la web
 * (VITE_API_URL): en desarrollo apunta al API local desde .env.local, y en
 * produccion el workflow de despliegue la pasa al build. No es un secreto; es
 * una URL que termina escrita en el JavaScript servido.
 */
const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

/** Error con el mensaje listo para mostrarse al usuario, en espanol. */
export class ErrorApi extends Error {}

async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  if (!BASE) {
    throw new ErrorApi('La aplicación no sabe dónde está el servicio de tareas (falta VITE_API_URL).')
  }

  let respuesta: Response
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    // fetch solo lanza cuando no hubo respuesta: sin red, servicio caido o
    // bloqueado por CORS. El navegador no distingue entre ellos.
    throw new ErrorApi('No se pudo conectar con el servicio de tareas. Revisa tu conexión e inténtalo de nuevo.')
  }

  if (!respuesta.ok) {
    // El API responde { error: { codigo, mensaje } }; si el cuerpo no tiene esa
    // forma (un proxy, una pagina de error), se usa un mensaje generico.
    const datos: unknown = await respuesta.json().catch(() => null)
    const mensaje =
      typeof datos === 'object' &&
      datos !== null &&
      'error' in datos &&
      typeof datos.error === 'object' &&
      datos.error !== null &&
      'mensaje' in datos.error &&
      typeof datos.error.mensaje === 'string'
        ? datos.error.mensaje
        : `El servicio de tareas respondió con un error (${respuesta.status}).`
    throw new ErrorApi(mensaje)
  }

  return (respuesta.status === 204 ? undefined : await respuesta.json()) as T
}

export const api = {
  listarTareas: () => pedir<Task[]>('GET', '/tareas'),
  crearTarea: (title: string) => pedir<Task>('POST', '/tareas', { title }),
  actualizarTarea: (id: string, cambios: { title?: string; done?: boolean }) =>
    pedir<Task>('PATCH', `/tareas/${encodeURIComponent(id)}`, cambios),
  eliminarTarea: (id: string) => pedir<void>('DELETE', `/tareas/${encodeURIComponent(id)}`),
}

/** Cualquier error inesperado se muestra con un mensaje generico. */
export function mensajeDeError(error: unknown): string {
  return error instanceof ErrorApi ? error.message : 'Ocurrió un error inesperado.'
}
