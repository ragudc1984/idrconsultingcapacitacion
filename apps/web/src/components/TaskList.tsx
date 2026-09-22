import { Sparkle } from 'lucide-react'
import TaskItem from './TaskItem'
import type { Task } from '@idr/shared'
import type { Accion } from '../acciones'

interface TaskListProps {
  tasks: Task[]
  enCurso: ReadonlyMap<string, Accion>
  justAddedId: string | null
  onAnimationSettled: () => void
  onToggleDone: (id: string) => void
  onRequestDelete: (id: string) => void
  onUpdate: (id: string, title: string) => void
}

function TaskList({
  tasks,
  enCurso,
  justAddedId,
  onAnimationSettled,
  onToggleDone,
  onRequestDelete,
  onUpdate,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-6 py-10 text-center">
        <Sparkle
          className="text-[var(--violet)]"
          size={22}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <p className="text-[var(--text)]">Todavía no hay tareas.</p>
        <p className="text-sm text-[var(--text-muted)]">Agrega la primera arriba para empezar.</p>
      </div>
    )
  }

  return (
    <ul aria-label="Tareas" className="flex w-full flex-col">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          accionEnCurso={enCurso.get(task.id)}
          isNew={task.id === justAddedId}
          onAnimationSettled={onAnimationSettled}
          onToggleDone={onToggleDone}
          onRequestDelete={onRequestDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  )
}

export default TaskList
