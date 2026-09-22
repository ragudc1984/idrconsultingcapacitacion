import { crearApp } from './app.ts'
import { leerOrigenesPermitidos } from './cors.ts'
import { crearPrisma } from './db.ts'

// En Render el puerto lo asigna la plataforma por PORT; en desarrollo se usa
// 3000 para no chocar con Vite (5173).
const puerto: number = process.env.PORT ?? 3000
const origenesPermitidos = leerOrigenesPermitidos(process.env.CORS_ORIGINS)
const prisma = crearPrisma(process.env.DATABASE_URL)

crearApp({ origenesPermitidos, prisma }).listen(puerto, () => {
  console.log(`API de tareas escuchando en http://localhost:${puerto}`)
  console.log(`Orígenes permitidos: ${origenesPermitidos.join(', ') || '(ninguno)'}`)
})
