# Historial y papelera de matrículas

Acceso exclusivo: `/personal/super-admin/`. La clave se configura solo en el servidor mediante `MATRICULA_SUPER_TOKEN`; nunca se incluye en código, URLs ni almacenamiento del navegador.

## Permisos

- Lectura: listado y consulta individual de fichas activas.
- Administración: consulta, preparación de impresión, exportación y envío a papelera.
- Super administración: todos los permisos anteriores y acceso al historial, exportación del historial, revisión de papelera, restauración y borrado definitivo confirmado.
- Claves coincidentes conservan el permiso más bajo. Configurar claves distintas.

El registro identifica perfiles de acceso, no personas individuales que compartan una clave. Registra acciones desde la activación; no reconstruye eventos anteriores. Preparar una impresión no prueba que una impresora haya impreso el documento.

## Datos y despliegue

La migración se ejecuta en el esquema seleccionado por `databaseSchema`, con el bloqueo de migración existente. Añade `deleted_at` y `deleted_by`, crea `matriculas_2027_historial` y no borra ni copia fichas existentes. Los entornos Preview y desarrollo permanecen aislados de `public`. El historial conserva fecha, acción, perfil, comprobantes y detalles mínimos; no duplica la ficha ni sus datos de salud.

Las fichas en papelera mantienen sus datos completos y quedan excluidas de consultas ordinarias, CSV, Word y preparación de impresión, incluso por comprobante directo. El borrado definitivo solo acepta una ficha ya en papelera, con credencial super y confirmación `ELIMINAR` vinculada al mismo comprobante. No hay vaciado masivo ni caducidad automática.

Cada cambio de estado y su evento se ejecutan en una sola sentencia PostgreSQL con CTE. Un fallo del historial revierte el cambio; peticiones repetidas o sobre un estado ya cambiado no duplican eventos. El evento de borrado permanece con el comprobante después de eliminar la ficha.

No hay modificación de filas reales ni pruebas de borrado sobre producción durante la preparación del cambio. Las pruebas automatizadas usan PostgreSQL en memoria (PGlite), credenciales ficticias y transporte de correo simulado.

## Comprobación

Ejecutar `npm test` y `npx tsc --noEmit`. `tests/matricula-audit.test.ts` ejecuta las rutas y SQL reales sobre una base local efímera: migración de una tabla anterior, creación idempotente, controles de rol, exclusión de papelera, restauración, confirmación, rollback por fallo de registro, exportación e aislamiento Preview.

## Número estable de ficha

`numero_ficha` es un número correlativo, único y no editable desde el formulario. La migración numera las fichas existentes por `created_at, id` sin cambiar sus comprobantes UUID; las nuevas usan una secuencia propia del esquema. La misma numeración aparece en listado, ficha, impresión, CSV, Word, papelera e historial. Filtrar, paginar y restaurar no cambia el número. El borrado definitivo no lo libera para reutilización; pueden quedar saltos por borrados o transacciones canceladas. Las pruebas comprueban también este comportamiento.
