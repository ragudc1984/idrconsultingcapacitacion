import cors from 'cors'

/**
 * Lee la lista blanca de CORS_ORIGINS ("https://a.com, http://localhost:5173").
 * El comodin se rechaza al arrancar: funciona en todos lados, y por eso nadie
 * descubre lo que abre hasta que es tarde.
 */
export function leerOrigenesPermitidos(valor: string | undefined): string[] {
  const origenes = (valor ?? '')
    .split(',')
    .map((origen) => origen.trim())
    .filter((origen) => origen.length > 0)

  if (origenes.includes('*')) {
    throw new Error('CORS_ORIGINS no puede contener "*": declara cada origen permitido.')
  }
  return origenes
}

/**
 * A un origen declarado se le devuelve la cabecera de autorizacion; a uno no
 * declarado no se le devuelve nada y el navegador bloquea la respuesta. Las
 * peticiones sin Origin (curl, la comprobacion de disponibilidad de Railway) no
 * son de navegador y CORS no aplica.
 */
export function crearCors(origenesPermitidos: string[]) {
  return cors({
    origin: (origen, responder) => {
      responder(null, origen !== undefined && origenesPermitidos.includes(origen))
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
}
