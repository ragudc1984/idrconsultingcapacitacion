import { LoaderCircle, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Lo que ocupa el lugar de la lista mientras no hay lista: la carga inicial o
 * su fallo. Nunca el estado vacio, que diria que no hay tareas cuando todavia
 * no se sabe.
 *
 * Sin animacion en bucle: el presupuesto de movimiento de DESIGN.md es de
 * 300ms, y un indicador que gira indefinidamente lo rompe. La señal de "en
 * curso" es el icono y el texto, identicos con o sin reduced-motion.
 */
interface EstadoCargaProps {
  estado: 'cargando' | 'error'
  mensaje: string
  reintentando: boolean
  onRetry: () => void
}

/** Tras esto la espera deja de ser normal: el servicio probablemente dormia. */
const ESPERA_LARGA_MS = 4000

function EstadoCarga({ estado, mensaje, reintentando, onRetry }: EstadoCargaProps) {
  const [esperaLarga, setEsperaLarga] = useState(false)

  useEffect(() => {
    if (estado !== 'cargando') {
      return
    }
    const temporizador = setTimeout(() => setEsperaLarga(true), ESPERA_LARGA_MS)
    return () => clearTimeout(temporizador)
  }, [estado])

  if (estado === 'cargando') {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <LoaderCircle className="text-[var(--text-muted)]" size={22} strokeWidth={1.75} aria-hidden="true" />
        <p className="text-[var(--text)]">Cargando tareas…</p>
        {esperaLarga && (
          <p className="text-sm text-[var(--text-muted)]">
            El servicio puede tardar hasta un minuto en responder si estuvo inactivo. Tus tareas no se
            perdieron.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-[var(--danger)] px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-[var(--text)]">No se pudieron cargar las tareas.</p>
        <p className="text-sm text-[var(--text-muted)]">{mensaje}</p>
      </div>
      {/* aria-disabled y no disabled: un botón disabled pierde el foco y lo
          manda al <body>. Aquí conserva el foco y el nombre mientras espera. */}
      <button
        type="button"
        onClick={reintentando ? undefined : onRetry}
        aria-disabled={reintentando || undefined}
        aria-busy={reintentando || undefined}
        className="focus-ring-violet touch-target inline-flex items-center gap-2 rounded-full px-4 py-2 text-[var(--text-muted)] transition hover:text-[var(--violet)] hover:shadow-[0_0_12px_var(--violet-glow)] aria-disabled:cursor-progress aria-disabled:hover:text-[var(--text-muted)] aria-disabled:hover:shadow-none"
      >
        {reintentando ? (
          <LoaderCircle size={18} aria-hidden="true" />
        ) : (
          <RotateCw size={18} aria-hidden="true" />
        )}
        {reintentando ? 'Reintentando…' : 'Reintentar'}
      </button>
    </div>
  )
}

export default EstadoCarga
