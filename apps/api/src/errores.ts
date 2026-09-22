import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

/**
 * Todo error sale con la misma forma: `{ error: { codigo, mensaje } }`, con el
 * mensaje en espanol listo para mostrarse. Tres codigos cubren los casos del
 * spec; no hace falta un catalogo mayor.
 */
type Codigo = 'SOLICITUD_INVALIDA' | 'NO_ENCONTRADO' | 'ERROR_INTERNO'

const ESTADO: Record<Codigo, number> = {
  SOLICITUD_INVALIDA: 400,
  NO_ENCONTRADO: 404,
  ERROR_INTERNO: 500,
}

export class ErrorHttp extends Error {
  readonly codigo: Codigo

  constructor(codigo: Codigo, mensaje: string) {
    super(mensaje)
    this.codigo = codigo
  }
}

export const tareaNoEncontrada = () =>
  new ErrorHttp('NO_ENCONTRADO', 'No existe ninguna tarea con ese identificador.')

/** Para cualquier ruta que no exista. */
export const rutaNoEncontrada: RequestHandler = (req, _res, next) => {
  next(new ErrorHttp('NO_ENCONTRADO', `No existe la ruta ${req.method} ${req.path}.`))
}

/** express.json marca asi los cuerpos que no puede leer. */
function esErrorDeCuerpo(error: unknown): error is { type: string } {
  return typeof error === 'object' && error !== null && 'type' in error && typeof error.type === 'string'
}

export const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  let codigo: Codigo
  let mensaje: string

  if (error instanceof ErrorHttp) {
    codigo = error.codigo
    mensaje = error.message
  } else if (error instanceof ZodError) {
    codigo = 'SOLICITUD_INVALIDA'
    mensaje = error.issues[0]?.message ?? 'La solicitud no es válida.'
  } else if (esErrorDeCuerpo(error) && error.type === 'entity.parse.failed') {
    codigo = 'SOLICITUD_INVALIDA'
    mensaje = 'El cuerpo de la solicitud no es JSON válido.'
  } else if (esErrorDeCuerpo(error) && error.type === 'entity.too.large') {
    codigo = 'SOLICITUD_INVALIDA'
    mensaje = 'El cuerpo de la solicitud es demasiado grande.'
  } else {
    // El detalle va al registro del servidor, nunca a la respuesta: una traza
    // puede revelar rutas, versiones o fragmentos de la consulta.
    console.error(error)
    codigo = 'ERROR_INTERNO'
    mensaje = 'Ocurrió un error inesperado en el servidor.'
  }

  res.status(ESTADO[codigo]).json({ error: { codigo, mensaje } })
}
