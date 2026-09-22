import { createTaskSchema, updateTaskSchema, type Task } from '@idr/shared'
import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from './db.ts'
import { tareaNoEncontrada } from './errores.ts'

/** Lo que se devuelve de una tarea: exactamente el tipo compartido. */
const campos = { id: true, title: true, done: true } as const

/**
 * Un id que no es un UUID no puede corresponder a ninguna tarea. Se responde
 * 404 en vez de dejar que PostgreSQL rechace el valor con un error interno.
 */
const idSchema = z.uuid()

function leerId(valor: string): string {
  const resultado = idSchema.safeParse(valor)
  if (!resultado.success) {
    throw tareaNoEncontrada()
  }
  return resultado.data
}

/** Prisma marca con P2025 la operacion sobre un registro que no existe. */
function esRegistroInexistente(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025'
}

export function crearRutasDeTareas(prisma: Prisma) {
  const rutas = Router()

  // Orden de creacion; el id desempata dos tareas creadas en el mismo instante
  // para que el orden no cambie entre lecturas.
  rutas.get('/', async (_req, res) => {
    const tareas: Task[] = await prisma.task.findMany({
      select: campos,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    })
    res.json(tareas)
  })

  // El esquema compartido descarta cualquier id o done que mande el cliente.
  rutas.post('/', async (req, res) => {
    const { title } = createTaskSchema.parse(req.body ?? {})
    const tarea: Task = await prisma.task.create({ data: { title }, select: campos })
    res.status(201).json(tarea)
  })

  rutas.patch('/:id', async (req, res) => {
    const id = leerId(req.params.id)
    const cambios = updateTaskSchema.parse(req.body ?? {})
    try {
      const tarea: Task = await prisma.task.update({ where: { id }, data: cambios, select: campos })
      res.json(tarea)
    } catch (error) {
      throw esRegistroInexistente(error) ? tareaNoEncontrada() : error
    }
  })

  rutas.delete('/:id', async (req, res) => {
    const id = leerId(req.params.id)
    try {
      await prisma.task.delete({ where: { id } })
      res.status(204).end()
    } catch (error) {
      throw esRegistroInexistente(error) ? tareaNoEncontrada() : error
    }
  })

  return rutas
}
