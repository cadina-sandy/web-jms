# Escuela Julio Montt Salamanca

Sitio Next.js conectado a Vercel como `escuela-juliomontt`.

- `npm ci`: instalar dependencias.
- `npm run dev`: desarrollo con vinext.
- `npm run build:pages`: compilación Next.js usada por Vercel (incluye API).
- `npm test`: pruebas de matrícula y exportación.

El servidor necesita `MATRICULA_DATABASE_URL` (Neon). Para exportar desde `/personal/matriculas/`, configurar `MATRICULA_EXPORT_TOKEN` y entregar la clave solo al personal autorizado. Mantener secretos en Vercel o `.env.local`, nunca en Git ni en variables `NEXT_PUBLIC_*`.

Consulta [la auditoría de matrícula 2027](docs/matricula-2027-review.md) para el esquema, pruebas reales, riesgos y pendientes antes de producción. La versión actual de Next.js tiene avisos críticos de seguridad pendientes de actualización.

GitHub Pages conserva una publicación manual; su formulario remite a Vercel porque un sitio estático no ejecuta la API.
