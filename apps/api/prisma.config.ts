import { defineConfig } from 'prisma/config'

// Prisma 7 no carga el .env por su cuenta. Se usa el cargador nativo de Node
// en lugar de dotenv; en Railway no hay .env y las variables ya vienen del
// servicio, por eso la ausencia del archivo no es un error.
try {
  process.loadEnvFile()
} catch {
  // Sin .env: se usan las variables de entorno del proceso.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
