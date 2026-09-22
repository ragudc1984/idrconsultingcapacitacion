import { useEffect, useRef, useState } from 'react'

interface ConfirmDeleteModalProps {
  taskTitle: string
  onCancel: () => void
  onConfirm: () => void
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function ConfirmDeleteModal({ taskTitle, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const pointerDownOnBackdrop = useRef(false)

  // Capturado en el render inicial: en el cleanup, document.activeElement ya
  // apunta a un botón del propio modal.
  const [previouslyFocused] = useState(() =>
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  )

  useEffect(() => {
    cancelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key !== 'Tab') {
        return
      }

      // aria-modal promete un contexto cerrado; sin esto el tabulador se
      // escapa a la lista de fondo, que sigue siendo alcanzable.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusables || focusables.length === 0) {
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      const inside = active instanceof Node && dialogRef.current?.contains(active)

      if (event.shiftKey && (!inside || active === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused && document.body.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [onCancel, previouslyFocused])

  return (
    <div
      className="modal-shell fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)]"
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        // Sólo cierra si el gesto empezó y terminó fuera del diálogo: de otro
        // modo, seleccionar texto y soltar el mouse fuera borra la tarea.
        if (pointerDownOnBackdrop.current && event.target === event.currentTarget) {
          onCancel()
        }
        pointerDownOnBackdrop.current = false
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-message"
        aria-describedby="confirm-delete-target"
        className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-modal)]"
      >
        {/* h2 y no p: es el nombre accesible del diálogo, así que debe ser
            navegable como encabezado. El preflight de Tailwind hereda tamaño y
            peso, de modo que se ve exactamente igual que antes. */}
        <h2 id="confirm-delete-message" className="text-[var(--text)]">
          ¿Eliminar esta tarea?
        </h2>
        <p
          id="confirm-delete-target"
          className="task-title mt-2 text-sm text-[var(--text-muted)]"
        >
          {taskTitle}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="focus-ring-violet touch-target inline-flex items-center justify-center rounded-full px-4 py-2 text-[var(--text-muted)] transition hover:text-[var(--violet)] hover:shadow-[0_0_12px_var(--violet-glow)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="focus-ring-magenta touch-target inline-flex items-center justify-center rounded-full bg-[var(--magenta)] px-4 py-2 font-medium text-[var(--bg)] transition hover:shadow-[0_0_18px_var(--magenta-glow)]"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
