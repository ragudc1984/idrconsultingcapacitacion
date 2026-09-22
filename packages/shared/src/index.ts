import { z } from 'zod'

/**
 * Contrato compartido entre la aplicacion web y el API. La regla del titulo se
 * escribe una sola vez y la aplican los dos lados: la web para no mandar datos
 * invalidos, el API porque no puede confiar en el cliente.
 *
 * El paquete exporta TypeScript sin compilar: Vite lo empaqueta en la web y tsx
 * lo ejecuta en el API, asi que no hay un orden de build entre workspaces.
 */

/** Tope de titulo. Evita que un pegado accidental de 2 MB llegue a la base. */
export const MAX_TITLE_LENGTH = 200

/** Se recorta antes de medir: "  hola  " es un titulo de 4 caracteres. */
export const titleSchema = z
  .string({ error: 'El título tiene que ser texto.' })
  .trim()
  .min(1, { error: 'El título no puede estar vacío.' })
  .max(MAX_TITLE_LENGTH, {
    error: `El título no puede superar los ${MAX_TITLE_LENGTH} caracteres.`,
  })

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
})

export type Task = z.infer<typeof taskSchema>

/**
 * Sin `id` ni `done`: el servicio asigna el identificador y toda tarea nace sin
 * completar. Un `id` enviado por el cliente se descarta al parsear.
 */
export const createTaskSchema = z.object({
  title: titleSchema,
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

/** Actualizacion parcial: el campo ausente conserva su valor. */
export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    done: z.boolean({ error: 'El estado de completada tiene que ser verdadero o falso.' }).optional(),
  })
  .refine((cambios) => cambios.title !== undefined || cambios.done !== undefined, {
    error: 'La actualización tiene que incluir el título, el estado de completada, o ambos.',
  })

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
