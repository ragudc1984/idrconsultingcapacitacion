import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { MAX_TITLE_LENGTH } from '../storage'

interface TaskFormProps {
  inputRef?: RefObject<HTMLInputElement | null>
  onCreate: (title: string) => void
}

function TaskForm({ inputRef, onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()
  const errorId = useId()

  const remaining = MAX_TITLE_LENGTH - title.length
  const showRemaining = remaining <= 20

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      // Antes no pasaba nada al enviar vacío: parecía un botón roto.
      setError('Escribe un título para la tarea.')
      inputRef?.current?.focus()
      return
    }
    onCreate(trimmed)
    setTitle('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="no-print flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-3">
        <label htmlFor={inputId} className="sr-only">
          Título de la tarea
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error) {
              setError('')
            }
          }}
          placeholder="Ej.: Revisar el informe mensual"
          maxLength={MAX_TITLE_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="focus-underline min-w-0 flex-1 border-b border-[var(--border)] bg-transparent px-0.5 py-2 text-base text-[var(--text)] placeholder:text-[var(--text-muted)] transition focus:border-[var(--ring-cyan)] focus:shadow-[0_1px_0_0_var(--ring-cyan)] aria-invalid:border-[var(--danger)]"
        />
        <button
          type="submit"
          aria-label="Agregar tarea"
          className="focus-ring-cyan touch-target flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cyan)] text-[var(--bg)] transition hover:shadow-[0_0_18px_var(--cyan-glow)]"
        >
          <Plus size={20} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      {!error && showRemaining && (
        <p aria-live="polite" className="text-sm text-[var(--text-muted)]">
          {remaining === 0
            ? 'Llegaste al límite de 200 caracteres.'
            : remaining === 1
              ? 'Queda 1 carácter.'
              : `Quedan ${remaining} caracteres.`}
        </p>
      )}
    </form>
  )
}

export default TaskForm
