import express from 'express'
import { crearCors } from './cors.ts'
import type { Prisma } from './db.ts'
import { ErrorHttp, manejarErrores, rutaNoEncontrada } from './errores.ts'
import { crearRutasDeTareas } from './tareas.ts'

type Opciones = {
  origenesPermitidos: string[]
  prisma: Prisma
}

/**
 * Construye la aplicacion sin ponerla a escuchar, para que server.ts decida el
 * puerto y la configuracion, y el arranque quede separado de las rutas.
 */
export function crearApp({ origenesPermitidos, prisma }: Opciones) {
  const app = express()
  app.use(crearCors(origenesPermitidos))
  app.use(express.json())

  app.get('/', (_req, res) => {
    res.json({ servicio: 'API de tareas' })
  })

  // Render la consulta para saber si la version nueva puede recibir trafico:
  // no basta con que el proceso este vivo, tiene que alcanzar la base.
  app.get('/salud', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      console.error('La comprobación de disponibilidad no alcanzó la base de datos:', error)
      throw new ErrorHttp('ERROR_INTERNO', 'El servicio no puede acceder al almacenamiento de tareas.')
    }
    res.json({ estado: 'disponible' })
  })

  app.use('/tareas', crearRutasDeTareas(prisma))

  // Siempre al final: lo que no coincidio con ninguna ruta es un 404, y todo
  // error, de cualquier ruta, sale por el mismo manejador.
  app.use(rutaNoEncontrada)
  app.use(manejarErrores)

  return app
}
