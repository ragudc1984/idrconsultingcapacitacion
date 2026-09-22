import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.ts'

/**
 * Prisma 7 se conecta a traves de un adaptador del driver `pg`. La cadena de
 * conexion es secreta: llega por DATABASE_URL y nunca se registra.
 */
export function crearPrisma(urlBaseDeDatos: string | undefined) {
  if (!urlBaseDeDatos) {
    throw new Error('Falta DATABASE_URL: copia apps/api/.env.example como .env y completa la cadena de conexión.')
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: urlBaseDeDatos }) })
}

export type Prisma = ReturnType<typeof crearPrisma>
