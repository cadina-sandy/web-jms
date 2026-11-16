# Matrícula 2027: cambios y auditoría de despliegue

## Situación encontrada

El formulario existente solo ejecutaba `preventDefault`: no guardaba, no tenía botón de envío, validación de obligatorios ni exportación. `output: 'export'` impedía ejecutar un POST de Next.js en Vercel. El proyecto conectado a este repositorio es `escuela-juliomontt` (`prj_wwZcejuim01PHuSmpauDgY0oRj8m`), no `web-jms`. Neon ya estaba provisionado; `MATRICULA_DATABASE_URL` existe para Preview y Production como secreto de integración. No fue necesario crear otra base ni copiar credenciales.

## Cambios preparados

- Guardar Matrícula envía JSON a `POST /api/matriculas`. Cliente y servidor comparten validación; los errores aparecen junto a cada campo, con foco y desplazamiento al primero. Si falla la conexión, la ficha permanece en pantalla.
- `matriculas_2027` guarda cada respuesta en una columna de texto separada, sin agrupar toda la ficha en JSON. Identificación, número y dígito, usuario y dominio del correo, detalles «otro» y cada dato de retiro tienen columnas propias. Cada opción de convivencia tiene un sí/no separado. Se admiten hasta diez personas para retiro (límite visible en el botón).
- La tabla se crea sin borrar tablas previas, en la misma transacción del primer guardado. Las consultas parametrizan los valores y solo usan identificadores de una lista fija. El cliente Neon se inicializa al recibir solicitudes; compilar no requiere credenciales.
- Un UUID por envío evita duplicados al reintentar una respuesta perdida. Tras guardar se muestra comprobante y se bloquea un nuevo envío desde esa ficha.
- Correo del estudiante opcional; si se empieza a completar se exige un correo válido. Ambos correos tienen «Otra» y entrada para dominio sin @.
- Segundo apellido, vivienda complementaria y apoderado suplente son opcionales. Si se empieza a completar un suplente o una persona de retiro, deben completarse sus datos. Los detalles condicionales se exigen solo cuando aplican. La autorización de imagen es opcional; si se completa, requiere apoderado y nombre para firma.
- `/personal/matriculas/` permite agregar/quitar columnas y moverlas con botones antes de descargar CSV. `POST /api/matriculas/exportar` exige `MATRICULA_EXPORT_TOKEN` del servidor. No basta seleccionar un funcionario en la ficha. No se persiste la clave en almacenamiento del navegador ni se coloca en una URL. CSV con BOM UTF-8, comillas escapadas, fórmulas neutralizadas y respuesta `no-store`; rechaza columnas ajenas a la lista permitida. Límite explícito de 10.000 registros para no truncar silenciosamente.
- Vercel conserva `npm run build:pages` pero genera rutas dinámicas. GitHub Pages queda como publicación manual: retira las rutas servidor antes de exportar y remite la matrícula al sitio Vercel, porque Pages no puede guardar en Neon. El enlace Vercel es configurable en ese workflow.

## Configuración y pendientes antes de producción

1. Crear `MATRICULA_EXPORT_TOKEN` como secreto de Production en el proyecto Vercel, con una clave aleatoria de al menos 32 bytes; entregarla al personal autorizado por un canal seguro y rotarla al cambiar permisos. Sin esa variable, exportar falla de forma cerrada (503). La rama de revisión usa una clave distinta, limitada a su Preview. No se incluyeron secretos en Git.
2. Verificar aislamiento de Neon: Preview y Production tienen asignada la integración al mismo store. No se puede inferir del listado si Neon crea ramas separadas. La prueba crea exclusivamente una ficha marcada PRUEBA FICTICIA / NO REAL; el comprobante queda registrado abajo. No usar fichas reales en Preview hasta confirmar ese aislamiento.
3. El rol de conexión necesita CREATE TABLE para el primer guardado. Para un despliegue con rol restringido, ejecutar previamente el SQL de `lib/matricula/db.ts` mediante un rol de migración y mantener solo INSERT/SELECT para la aplicación. Cambios futuros de esquema requieren una migración explícita; CREATE IF NOT EXISTS no altera una tabla previa.
4. La clave compartida es un control de acceso inicial, sin auditoría individual de funcionarios. Si se requieren cuentas nominativas y revocación individual, integrar el proveedor de identidad del colegio antes de distribuir acceso masivo. La ficha pública permite solicitudes desde su propio origen; para abuso automatizado se requiere una política de rate limiting/BotID/WAF según volumen.
5. El proyecto tiene Vercel Authentication para dominios Vercel (excepto dominios propios). Comprobar el acceso público deseado antes de la apertura de matrículas. No se modificó esa protección.
6. El enlace «EXTRACTO DEL REGLAMENTO INTERNO» aún abre el reglamento completo. Falta el documento específico. El campo de nombre para firma no sustituye la firma presencial anunciada en el paso 3. Confirmar también con el colegio la lista definitiva de campos obligatorios y opciones que actualmente no incluyen «Ninguno» en programas de apoyo familiar.
7. No se ha fusionado la rama ni promovido un despliegue de producción.

## Validación

- `npm test`: validación compartida, correo opcional y dominios personalizados, obligatorios y detalles condicionales, teléfonos/fechas, respuestas separadas y CSV seguro.
- `npm run build:pages`: compilación real Next.js, incluidas las dos rutas dinámicas.
- `npm run lint`: sin errores; advertencias preexistentes por imágenes HTML.
- `scripts/matricula-smoke.ts`: prueba explícita de navegador con ficha ficticia, comprobante, reintento idempotente, lectura de lo guardado mediante CSV, orden de columnas, rechazo de acceso y descarga desde la pantalla del personal. Ejecutar con `MATRICULA_SMOKE=1`, `MATRICULA_TEST_URL`, `MATRICULA_EXPORT_TOKEN` y, si aplica, `MATRICULA_TEST_SHARE_URL`. Usa Chromium instalado, configurable con `CHROMIUM_PATH`. La prueba escribe una ficha y no borra registros.

Resultado de la prueba de Preview: pendiente de ejecución al terminar la compilación remota.
