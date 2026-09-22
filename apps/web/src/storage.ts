import type { Task } from './types'

const TASKS_STORAGE_KEY = 'todo-list:tasks'

/** Tope de título. Evita que un pegado accidental de 2 MB llene el storage. */
export const MAX_TITLE_LENGTH = 200

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Valida cada elemento por separado: un `localStorage` corrupto con
 * `["hola", null]` pasaría un simple `Array.isArray` y produciría filas sin id
 * ni título, imposibles de borrar desde la interfaz.
 */
function toTask(value: unknown): Task | null {
  if (!isRecord(value)) {
    return null
  }
  const { id, title, done } = value
  if (typeof id !== 'string' || id.length === 0) {
    return null
  }
  if (typeof title !== 'string') {
    return null
  }
  return {
    id,
    title: title.slice(0, MAX_TITLE_LENGTH),
    done: done === true,
  }
}

export function loadTasks(): Task[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(TASKS_STORAGE_KEY)
  } catch {
    // Safari en modo privado y algunas políticas de empresa lanzan al leer.
    return []
  }

  if (!raw) {
    return []
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  const seen = new Set<string>()
  const tasks: Task[] = []
  for (const candidate of parsed) {
    const task = toTask(candidate)
    if (!task || seen.has(task.id)) {
      continue
    }
    seen.add(task.id)
    tasks.push(task)
  }
  return tasks
}

/** Lanza si el almacenamiento no está disponible o se agotó la cuota. */
export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
}

/**
 * `crypto.randomUUID` sólo existe en contextos seguros: es `undefined` al
 * abrir la app por HTTP desde la IP de la red local, que es justo como se
 * prueba desde el celular.
 */
export function createTaskId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = crypto.getRandomValues(new Uint8Array(16))
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    }
  }
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
