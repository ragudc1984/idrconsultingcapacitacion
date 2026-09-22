import { useCallback, useEffect, useRef, useState } from 'react'
import type { Task } from '@idr/shared'
import { NUEVA, type Accion } from './acciones'
import { api, mensajeDeError } from './api'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import EstadoCarga from './components/EstadoCarga'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import ThemeToggle from './components/ThemeToggle'

/**
 * Tres formas, no un booleano junto a un array: "cargando y con tareas" no
 * existe, y modelarlo asi impide por construccion que el estado vacio se pinte
 * mientras las tareas todavia vienen en camino.
 */
type EstadoLista =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string; reintentando: boolean }
  | { estado: 'lista'; tareas: Task[] }

function App() {
  const [lista, setLista] = useState<EstadoLista>({ estado: 'cargando' })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [enCurso, setEnCurso] = useState<ReadonlyMap<string, Accion>>(new Map())

  const addInputRef = useRef<HTMLInputElement>(null)
  const restoreFocusAfterDelete = useRef(false)
  const focusAfterRetry = useRef(false)
  // El estado de React se actualiza despues del render; un doble click cae
  // dentro del mismo ciclo y veria el mapa viejo. La ref se consulta en el acto.
  const enCursoRef = useRef(new Map<string, Accion>())

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
   * Lectura inicial. No escribe nada en el servicio, por eso vive fuera de
   * commitTasks; lo que si comparte con el es que el anuncio dice lo que pasó.
   */
  const cargarTareas = useCallback(async () => {
    setAnnouncement('Cargando tareas…')
    try {
      const tareas = await api.listarTareas()
      setLista({ estado: 'lista', tareas })
      setAnnouncement(
        tareas.length === 0
          ? 'Tareas cargadas. Todavía no hay tareas.'
          : tareas.length === 1
            ? 'Tareas cargadas: 1 tarea.'
            : `Tareas cargadas: ${tareas.length} tareas.`,
      )
    } catch (error) {
      setLista({ estado: 'error', mensaje: mensajeDeError(error), reintentando: false })
      setAnnouncement(`No se pudieron cargar las tareas. ${mensajeDeError(error)}`)
    }
  }, [])

  // Un reintento exitoso retira el botón que tenía el foco; sin un destino
  // definido, el foco caería al <body>.
  useEffect(() => {
    if (lista.estado === 'lista' && focusAfterRetry.current) {
      focusAfterRetry.current = false
      addInputRef.current?.focus()
    }
  }, [lista.estado])

  useEffect(() => {
    // Diferida a una microtarea: el anuncio de "Cargando" tiene que cambiar
    // cuando la región aria-live ya está en el DOM (un lector de pantalla no
    // anuncia el contenido inicial de una región), y así el efecto no fija
    // estado de forma síncrona durante el montaje.
    queueMicrotask(() => void cargarTareas())
  }, [cargarTareas])

  function handleRetry() {
    // El mensaje de error se queda en pantalla durante el reintento: si falla
    // otra vez, no parpadea; si funciona, lo reemplaza la lista.
    focusAfterRetry.current = true
    setLista((actual) => (actual.estado === 'error' ? { ...actual, reintentando: true } : actual))
    void cargarTareas()
  }

  /**
   * Un único punto de escritura, ahora contra el servicio. Ejecuta la
   * operación y sólo con la respuesta exitosa fija el estado —con lo que
   * devolvió el servidor— y anuncia la acción. Si falla, la lista no cambia y
   * el anuncio dice que no se guardó. Es la misma invariante que protegía
   * cuando las tareas vivían en el navegador: una sola ruta por la que la lista
   * cambia, y el anuncio nunca afirma algo que no ocurrió. No se hacen escrituras al API fuera de aquí.
   *
   * `aplicar` recibe la lista vigente al llegar la respuesta, no la de cuando
   * empezó la acción: dos acciones sobre tareas distintas pueden solaparse.
   */
  async function commitTasks(
    clave: string,
    accion: Accion,
    ejecutar: () => Promise<(tareas: Task[]) => Task[]>,
    mensajeExito: string,
    mensajeFallo: string,
  ): Promise<boolean> {
    if (enCursoRef.current.has(clave)) {
      return false
    }
    enCursoRef.current.set(clave, accion)
    setEnCurso(new Map(enCursoRef.current))

    try {
      const aplicar = await ejecutar()
      setLista((actual) => (actual.estado === 'lista' ? { estado: 'lista', tareas: aplicar(actual.tareas) } : actual))
      setSaveError(null)
      setAnnouncement(mensajeExito)
      return true
    } catch (error) {
      const detalle = mensajeDeError(error)
      setSaveError(`${mensajeFallo} ${detalle}`)
      setAnnouncement(`${mensajeFallo} ${detalle}`)
      return false
    } finally {
      enCursoRef.current.delete(clave)
      setEnCurso(new Map(enCursoRef.current))
    }
  }

  const tareas = lista.estado === 'lista' ? lista.tareas : []

  function handleToggleTheme() {
    setTheme((theme) => (theme === 'light' ? 'dark' : 'light'))
  }

  function handleCreateTask(title: string): Promise<boolean> {
    return commitTasks(
      NUEVA,
      'crear',
      async () => {
        const creada = await api.crearTarea(title)
        setJustAddedId(creada.id)
        return (actuales) => [...actuales, creada]
      },
      `Tarea agregada: ${title}`,
      'No se pudo agregar la tarea.',
    )
  }

  function handleToggleDone(id: string) {
    const task = tareas.find((task) => task.id === id)
    if (!task) {
      return
    }
    void commitTasks(
      id,
      'completar',
      async () => {
        const actualizada = await api.actualizarTarea(id, { done: !task.done })
        return (actuales) => actuales.map((item) => (item.id === id ? actualizada : item))
      },
      task.done ? `Tarea marcada como pendiente: ${task.title}` : `Tarea completada: ${task.title}`,
      task.done
        ? `No se pudo marcar como pendiente la tarea «${task.title}».`
        : `No se pudo completar la tarea «${task.title}».`,
    )
  }

  function handleRequestDelete(id: string) {
    if (!enCursoRef.current.has(id)) {
      setPendingDeleteId(id)
    }
  }

  function handleCancelDelete() {
    setPendingDeleteId(null)
  }

  function handleConfirmDelete() {
    const task = tareas.find((task) => task.id === pendingDeleteId)
    restoreFocusAfterDelete.current = true
    setPendingDeleteId(null)
    if (!task) {
      return
    }
    void commitTasks(
      task.id,
      'eliminar',
      async () => {
        await api.eliminarTarea(task.id)
        return (actuales) => actuales.filter((item) => item.id !== task.id)
      },
      `Tarea eliminada: ${task.title}`,
      `No se pudo eliminar la tarea «${task.title}».`,
    )
  }

  function handleUpdateTask(id: string, title: string) {
    const task = tareas.find((task) => task.id === id)
    if (!task) {
      return
    }
    void commitTasks(
      id,
      'editar',
      async () => {
        const actualizada = await api.actualizarTarea(id, { title })
        return (actuales) => actuales.map((item) => (item.id === id ? actualizada : item))
      },
      `Tarea actualizada: ${title}`,
      `No se pudo cambiar el título de la tarea «${task.title}».`,
    )
  }

  // Derivado, no sincronizado: si la tarea desaparece mientras el modal está
  // abierto, el modal simplemente deja de renderizarse.
  const pendingDeleteTask = tareas.find((task) => task.id === pendingDeleteId) ?? null

  // Contaba tasks.length y las llamaba "activas", incluyendo las completadas.
  // Cada estado es una frase completa: concatenar fragmentos rompe en
  // traducción y en las reglas de plural. Con la lista vacía no dice nada,
  // porque el estado vacío justo debajo ya lo dice.
  const doneCount = tareas.filter((task) => task.done).length
  const pendingCount = tareas.length - doneCount

  let pendingLabel = ''
  if (tareas.length === 0) {
    pendingLabel = ''
  } else if (pendingCount === 0) {
    pendingLabel = 'Todo completado'
  } else if (doneCount === 0) {
    pendingLabel = pendingCount === 1 ? '1 tarea pendiente' : `${pendingCount} tareas pendientes`
  } else {
    pendingLabel = `${pendingCount} de ${tareas.length} pendientes`
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

        {/* Sin role propio: el mismo texto ya se anuncia por la región
            aria-live de abajo, y anunciarlo dos veces sería ruido. */}
        {saveError && (
          <p className="no-print mt-6 rounded-lg border border-[var(--danger)] px-4 py-3 text-sm text-[var(--text)]">
            {saveError}
          </p>
        )}

        <main className="mt-8 flex flex-col gap-8">
          <TaskForm
            inputRef={addInputRef}
            onCreate={handleCreateTask}
            isSaving={enCurso.has(NUEVA)}
            isReady={lista.estado === 'lista'}
          />
          {lista.estado === 'lista' ? (
            <TaskList
              tasks={lista.tareas}
              enCurso={enCurso}
              justAddedId={justAddedId}
              onAnimationSettled={() => setJustAddedId(null)}
              onToggleDone={handleToggleDone}
              onRequestDelete={handleRequestDelete}
              onUpdate={handleUpdateTask}
            />
          ) : (
            <EstadoCarga
              estado={lista.estado}
              mensaje={lista.estado === 'error' ? lista.mensaje : ''}
              reintentando={lista.estado === 'error' && lista.reintentando}
              onRetry={handleRetry}
            />
          )}
        </main>
      </div>

      {/* Los cambios de la lista son puramente visuales; sin esto un lector de
          pantalla no anuncia nada al cargar, crear, completar, editar o
          eliminar, ni cuando algo no se pudo guardar. */}
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
