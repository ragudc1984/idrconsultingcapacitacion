import express from 'express'
import { crearCors } from './cors.ts'
import { manejarErrores, rutaNoEncontrada } from './errores.ts'

type Opciones = {
  origenesPermitidos: string[]
}

/**
 * Construye la aplicacion sin ponerla a escuchar, para que server.ts decida el
 * puerto y la configuracion, y el arranque quede separado de las rutas.
 */
export function crearApp({ origenesPermitidos }: Opciones) {
  const app = express()
  app.use(crearCors(origenesPermitidos))
  app.use(express.json())

  app.get('/', (_req, res) => {
    res.json({ servicio: 'API de tareas' })
  })

  // Siempre al final: lo que no coincidio con ninguna ruta es un 404, y todo
  // error, de cualquier ruta, sale por el mismo manejador.
  app.use(rutaNoEncontrada)
  app.use(manejarErrores)

  return app
}
