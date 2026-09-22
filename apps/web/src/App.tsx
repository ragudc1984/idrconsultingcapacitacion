import { useEffect, useRef, useState } from 'react'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import ThemeToggle from './components/ThemeToggle'
import { createTaskId, loadTasks, saveTasks } from './storage'
import type { Task } from '@idr/shared'

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [storageError, setStorageError] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const addInputRef = useRef<HTMLInputElement>(null)
  const restoreFocusAfterDelete = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    // El tinte del navegador seguía a la preferencia del sistema operativo,
    // que es justo lo que este tema no consulta. Se deriva del token vigente
    // para no duplicar los hexadecimales fuera del CSS.
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim()
    if (bg) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
    }
  }, [theme])

  // Tras confirmar un borrado, el control que abrió el modal ya no existe, así
  // que el foco necesita un destino definido en lugar de caer al <body>.
  useEffect(() => {
    if (pendingDeleteId === null && restoreFocusAfterDelete.current) {
      restoreFocusAfterDelete.current = false
      addInputRef.current?.focus()
    }
  }, [pendingDeleteId])

  /**
   * Un único punto de escritura: el estado y `localStorage` no pueden
   * divergir, y un fallo de cuota se reporta en el momento de la acción que lo
   * provocó, no en un efecto posterior.
   */
  function commitTasks(next: Task[], message: string) {
    setTasks(next)
    try {
      saveTasks(next)
      setStorageError(false)
      setAnnouncement(message)
    } catch {
      // Cuota agotada o almacenamiento bloqueado: la app sigue usable en
      // memoria, pero el usuario debe saber que no se está guardando. El
      // anuncio se corrige aquí: antes decía "Tarea agregada" mientras el
      // aviso en pantalla decía que no se había guardado.
      setStorageError(true)
      setAnnouncement(`${message}, pero no se pudo guardar en este navegador.`)
    }
  }

  function handleToggleTheme() {
    setTheme((theme) => (theme === 'light' ? 'dark' : 'light'))
  }

  function handleCreateTask(title: string) {
    const id = createTaskId()
    setJustAddedId(id)
    commitTasks([...tasks, { id, title, done: false }], `Tarea agregada: ${title}`)
  }

  function handleToggleDone(id: string) {
    const task = tasks.find((task) => task.id === id)
    if (!task) {
      return
    }
    commitTasks(
      tasks.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      task.done
        ? `Tarea marcada como pendiente: ${task.title}`
        : `Tarea completada: ${task.title}`,
    )
  }

  function handleRequestDelete(id: string) {
    setPendingDeleteId(id)
  }

  function handleCancelDelete() {
    setPendingDeleteId(null)
  }

  function handleConfirmDelete() {
    const task = tasks.find((task) => task.id === pendingDeleteId)
    if (!task) {
      setPendingDeleteId(null)
      return
    }
    restoreFocusAfterDelete.current = true
    setPendingDeleteId(null)
    commitTasks(
      tasks.filter((item) => item.id !== task.id),
      `Tarea eliminada: ${task.title}`,
    )
  }

  function handleUpdateTask(id: string, title: string) {
    commitTasks(
      tasks.map((task) => (task.id === id ? { ...task, title } : task)),
      `Tarea actualizada: ${title}`,
    )
  }

  // Derivado, no sincronizado: si la tarea desaparece mientras el modal está
  // abierto, el modal simplemente deja de renderizarse.
  const pendingDeleteTask = tasks.find((task) => task.id === pendingDeleteId) ?? null

  // Contaba tasks.length y las llamaba "activas", incluyendo las completadas.
  // Cada estado es una frase completa: concatenar fragmentos rompe en
  // traducción y en las reglas de plural. Con la lista vacía no dice nada,
  // porque el estado vacío justo debajo ya lo dice.
  const doneCount = tasks.filter((task) => task.done).length
  const pendingCount = tasks.length - doneCount

  let pendingLabel = ''
  if (tasks.length === 0) {
    pendingLabel = ''
  } else if (pendingCount === 0) {
    pendingLabel = 'Todo completado'
  } else if (doneCount === 0) {
    pendingLabel = pendingCount === 1 ? '1 tarea pendiente' : `${pendingCount} tareas pendientes`
  } else {
    pendingLabel = `${pendingCount} de ${tasks.length} pendientes`
  }

  return (
    <div className="page-shell min-h-svh bg-[var(--bg)] transition-colors">
      <div className="mx-auto w-full max-w-xl">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
              Lista de tareas
            </h1>
            {pendingLabel && (
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">{pendingLabel}</p>
            )}
          </div>
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        </header>

        <div className="mt-8 h-px w-full bg-[var(--border)]" />

        {storageError && (
          <p
            role="status"
            className="no-print mt-6 rounded-lg border border-[var(--danger)] px-4 py-3 text-sm text-[var(--text)]"
          >
            No se pudieron guardar las tareas en este navegador; puede que el
            almacenamiento esté lleno o bloqueado. Las tareas siguen aquí hasta que
            cierres o recargues la pestaña.
          </p>
        )}

        <main className="mt-8 flex flex-col gap-8">
          <TaskForm inputRef={addInputRef} onCreate={handleCreateTask} />
          <TaskList
            tasks={tasks}
            justAddedId={justAddedId}
            onAnimationSettled={() => setJustAddedId(null)}
            onToggleDone={handleToggleDone}
            onRequestDelete={handleRequestDelete}
            onUpdate={handleUpdateTask}
          />
        </main>
      </div>

      {/* Los cambios de la lista son puramente visuales; sin esto un lector de
          pantalla no anuncia nada al crear, completar, editar o eliminar. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {pendingDeleteTask && (
        <ConfirmDeleteModal
          taskTitle={pendingDeleteTask.title}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

export default App
