import { createHash } from 'node:crypto';
export function databaseSchema(env: { VERCEL_ENV?: string; VERCEL_GIT_COMMIT_REF?: string } = { VERCEL_ENV: process.env.VERCEL_ENV, VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF }) {
  if (env.VERCEL_ENV === 'production') return 'public';
  if (env.VERCEL_ENV === 'preview') {
    if (!env.VERCEL_GIT_COMMIT_REF) throw new Error('Preview requiere una rama para aislar sus datos.');
    return `matricula_preview_${createHash('sha256').update(env.VERCEL_GIT_COMMIT_REF).digest('hex').slice(0, 16)}`;
  }
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'development') throw new Error('Entorno de datos no reconocido.');
  return 'matricula_development';
}
export function tableName(schema: string) { return `"${schema}"."matriculas_2027"`; }
