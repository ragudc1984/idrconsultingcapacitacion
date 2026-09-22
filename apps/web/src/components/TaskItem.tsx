import { Check, LoaderCircle, Pencil, Trash2 } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { MAX_TITLE_LENGTH } from '@idr/shared'
import type { Task } from '@idr/shared'
import type { Accion } from '../acciones'

interface TaskItemProps {
  task: Task
  /** La acción que se está guardando sobre esta tarea, si hay una. */
  accionEnCurso: Accion | undefined
  isNew: boolean
  onAnimationSettled: () => void
  onToggleDone: (id: string) => void
  onRequestDelete: (id: string) => void
  onUpdate: (id: string, title: string) => void
}

function TaskItem({
  task,
  accionEnCurso,
  isNew,
  onAnimationSettled,
  onToggleDone,
  onRequestDelete,
  onUpdate,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [error, setError] = useState('')
  const editButtonRef = useRef<HTMLButtonElement>(null)
  // Cerrar el modo edición devuelve el foco al lápiz, y eso hace que el input
  // pierda el foco: sin esta guarda, Enter confirmaría dos veces.
  const skipBlurCommitRef = useRef(false)
  const hintId = useId()
  const errorId = useId()

  // Mientras una acción de esta fila se guarda, ninguna otra puede empezar
  // sobre la misma tarea: un doble click no duplica nada y una edición no se
  // cruza con un borrado. El resto de la interfaz sigue usable.
  const ocupada = accionEnCurso !== undefined

  function startEditing() {
    if (ocupada) {
      return
    }
    setDraft(task.title)
    setError('')
    skipBlurCommitRef.current = false
    setIsEditing(true)
  }

  function closeEditing() {
    skipBlurCommitRef.current = true
    setIsEditing(false)
    setError('')
    editButtonRef.current?.focus()
  }

  function commitEdit() {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false
      return
    }
    const trimmed = draft.trim()
    if (!trimmed) {
      // Antes el título anterior reaparecía sin explicación y parecía un bug.
      // Ahora el campo queda abierto y el mensaje nombra la salida.
      setError('El título no puede quedar vacío. Escribe uno o presiona Escape para cancelar.')
      return
    }
    if (trimmed !== task.title) {
      onUpdate(task.id, trimmed)
    }
    closeEditing()
  }

  function cancelEdit() {
    setDraft(task.title)
    closeEditing()
  }

  // En el <li> y no en el input: si el campo quedó abierto con un error y el
  // foco se movió a otro control de la fila, Escape sigue siendo la salida.
  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (!isEditing) {
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
      return
    }
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault()
      commitEdit()
    }
  }

  return (
    <li
      onAnimationEnd={isNew ? onAnimationSettled : undefined}
      onKeyDown={handleKeyDown}
      className={`group relative flex flex-wrap items-center gap-3 border-b border-[var(--border)] py-3 pl-3 ${isNew ? 'animate-task-in' : ''}`}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-0.5 bg-[var(--cyan)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      />

      {isEditing ? (
        <input
          type="text"
          value={draft}
          autoFocus
          maxLength={MAX_TITLE_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-label={`Editar tarea: ${task.title}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) {
              setError('')
            }
          }}
          onBlur={commitEdit}
          className="focus-underline min-w-0 flex-1 border-b-2 border-[var(--ring-violet)] bg-transparent px-0.5 py-1 text-base text-[var(--text)] aria-invalid:border-[var(--danger)]"
        />
      ) : (
        <span
          className={`task-title min-w-0 flex-1 text-left text-[var(--text)] ${task.done ? 'line-through text-[var(--text-muted)]' : ''}`}
        >
          {task.title}
        </span>
      )}

      <button
        type="button"
        onClick={ocupada ? undefined : () => onToggleDone(task.id)}
        aria-disabled={ocupada || undefined}
        aria-busy={accionEnCurso === 'completar' || undefined}
        // Etiqueta estatica + aria-pressed es el patron de boton de alternancia:
        // el nombre dice que concepto controla, aria-pressed dice si esta activo.
        // Nombrar la tarea evita oir la misma cadena en cada fila de la lista.
        aria-label={`Completar tarea: ${task.title}`}
        aria-pressed={task.done}
        className={`focus-ring-cyan touch-target no-print inline-flex items-center justify-center rounded-full p-1.5 transition hover:text-[var(--cyan)] hover:shadow-[0_0_12px_var(--cyan-glow)] aria-disabled:cursor-progress aria-disabled:hover:shadow-none ${task.done ? 'text-[var(--cyan)]' : 'text-[var(--text-muted)]'}`}
      >
        {accionEnCurso === 'completar' ? (
          <LoaderCircle size={18} aria-hidden="true" />
        ) : (
          <Check size={18} aria-hidden="true" />
        )}
      </button>
      <button
        ref={editButtonRef}
        type="button"
        onClick={startEditing}
        aria-disabled={ocupada || undefined}
        aria-busy={accionEnCurso === 'editar' || undefined}
        aria-label={`Editar tarea: ${task.title}`}
        className="focus-ring-violet touch-target no-print inline-flex items-center justify-center rounded-full p-1.5 text-[var(--text-muted)] transition hover:text-[var(--violet)] hover:shadow-[0_0_12px_var(--violet-glow)] aria-disabled:cursor-progress aria-disabled:hover:shadow-none"
      >
        {accionEnCurso === 'editar' ? (
          <LoaderCircle size={18} aria-hidden="true" />
        ) : (
          <Pencil size={18} aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={ocupada ? undefined : () => onRequestDelete(task.id)}
        aria-disabled={ocupada || undefined}
        aria-busy={accionEnCurso === 'eliminar' || undefined}
        aria-label={`Eliminar tarea: ${task.title}`}
        className="focus-ring-magenta touch-target no-print inline-flex items-center justify-center rounded-full p-1.5 text-[var(--text-muted)] transition hover:text-[var(--magenta)] hover:shadow-[0_0_12px_var(--magenta-glow)] aria-disabled:cursor-progress aria-disabled:hover:shadow-none"
      >
        {accionEnCurso === 'eliminar' ? (
          <LoaderCircle size={18} aria-hidden="true" />
        ) : (
          <Trash2 size={18} aria-hidden="true" />
        )}
      </button>

      {isEditing && (
        <>
          <p id={hintId} className="sr-only">
            Enter para guardar, Escape para cancelar.
          </p>
          {error && (
            <p id={errorId} role="alert" className="w-full text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
        </>
      )}
    </li>
  )
}

export default TaskItem
