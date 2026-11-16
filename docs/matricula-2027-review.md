# Matrícula 2027 — revisión del PR #3

## Regla de obligatoriedad confirmada

El usuario confirmó: **todos los campos deben responderse, excepto el correo del estudiante y los detalles que no correspondan**. Se aplica tanto en cliente como en servidor. Una respuesta negativa o «No aplica» cuenta como respuesta; dejar vacío un campo aplicable no.

Se corrigieron las excepciones que la primera versión había dejado opcionales: segundo apellido, convivencia, fecha de nacimiento/educación/situación laboral/lugar de trabajo/RSH del apoderado, declaración sobre suplente, al menos una persona de retiro, medicamentos/alergias, dificultades de aprendizaje, tratamiento especialista, programa familiar, rol de quien matricula y decisión de uso de imagen.

- Segundo apellido: requiere respuesta; puede indicar «No aplica» si no tiene segundo apellido.
- Correo estudiante: completamente vacío es válido; si se empieza a completar se exige correo válido. Ambos correos admiten «Otra» con dominio sin @.
- Block/torre y departamento: detalles de vivienda solo si corresponden.
- Suplente: debe responder Sí o «No aplica: sin suplente». Con Sí se exigen nombre, parentesco, teléfono y RUT o IPA con dígito. Con No aplica se omiten sus detalles.
- Retiro: al menos una persona. Apoderado y suplente se ofrecen por nombre y copian sus datos de identificación/teléfono en columnas propias al guardar. «Otro» exige nombre, teléfono e identificación RUT/IPA. Se admiten hasta diez personas.
- Detalles de otra previsión/consultorio, diagnóstico, curso repetido, colegio de procedencia y nombres «Otro»: solo se exigen si la selección los habilita.
- Medicamentos/alergias, dificultades y tratamiento: responder «Ninguno», «Ninguna» o «No aplica» si corresponde, sin inventar diagnósticos.
- Uso de imagen: **es obligatorio decidir Sí/No, no es obligatorio autorizar**. Solo con Sí se pide quién autoriza y nombre para firma. Se mantiene la firma presencial anunciada.

## Casos donde faltaba «No aplica»

Se añadieron opciones explícitas en suplente (sin suplente), educación (sin escolaridad), situación laboral (sin actividad), lugar de trabajo, previsión (sin previsión), consultorio (sin consultorio) y programa familiar (ningún programa). En segundo apellido y respuestas de texto se indica cómo responder cuando no corresponde. No procede «No aplica» para nombres, fecha de nacimiento, identificación del estudiante/apoderado, domicilio, contacto de emergencia o decisión de imagen: se requiere el dato o una respuesta negativa válida.

## Ajustes de interacción

- Subtítulo «para reservar tu matrícula para alumnos antiguos».
- «Aquí» abre la ficha, desplaza hasta su título y le da foco sin ocultarlo bajo la cabecera.
- Convivencia cierra al hacer clic fuera o pulsar Escape y conserva los checks.
- Suplente con selección RUT/IPA.
- Retiro con nombres precargados del apoderado/suplente, y «Otro» para ingreso manual.
- Selector «Funcionario JMS»/«Apoderado» muestra la lista correspondiente; cambiar de rol reinicia la selección anterior. Esto identifica quién completa la ficha, no concede acceso al CSV.
- Guardar Matrícula verde, centrado, más ancho y alto que los campos; estado guardando y bloqueo tras éxito.
- Errores junto al campo, desplazamiento/foco al primer error según el orden del formulario. Si falla el guardado se conserva la ficha.

## Neon y separación de datos

Proyecto Vercel: `escuela-juliomontt` (`prj_wwZcejuim01PHuSmpauDgY0oRj8m`). La integración Neon existente `DataBasejms` (`store_OYUTbsTy6or9CWZn`) está conectada a Preview/Production con acciones de despliegue Neon. Se utiliza exclusivamente `MATRICULA_DATABASE_URL` del servidor; no se copiaron ni expusieron credenciales.

**Aislamiento explícito de la aplicación:** Production usa `public.matriculas_2027`; cada rama Preview usa `matricula_preview_<hash-de-rama>.matriculas_2027`; desarrollo usa `matricula_development.matriculas_2027`. Guardado y exportación seleccionan el mismo destino en el servidor. Preview sin rama y entornos desconocidos fallan de forma cerrada. No se migran ni copian fichas de `public` al espacio Preview. Los identificadores derivan de una lista fija y de hashes, nunca de SQL recibido del cliente.

La inicialización crea el esquema/tabla y añade las nuevas columnas sin borrar datos. Un bloqueo transaccional por esquema evita carreras entre primeros guardados concurrentes. Cada respuesta tiene su columna de texto, incluidas opciones de convivencia y cada dato de las personas de retiro; no se almacena la ficha entera en JSON. UUID por envío para reintentos idempotentes.

`POST /api/matriculas/verificar-aislamiento/` es una comprobación de solo lectura, protegida por la clave de personal y disponible **solo en Preview**. Dado un comprobante ficticio devuelve si está en el esquema Preview y si está en `public` de esa conexión. No devuelve datos de la ficha ni credenciales. Las pruebas comprueban `inPreview=true` e `inProductionNamespace=false`.

**Límite de la verificación:** la separación por esquema está impuesta y comprobada por la aplicación. Las herramientas conectadas enmascaran las credenciales de la integración y no exponen las identidades de ramas físicas de Neon; la consola web no estuvo disponible. No se afirma que se haya verificado una separación física de proyectos/ramas o permisos mínimos de base. Los esquemas impiden mezclar datos por las rutas de esta aplicación; un rol propietario puede consultar otros esquemas. Si se exige aislamiento mediante credenciales/ramas físicas, validar la configuración en Neon y asignar roles distintos con permisos mínimos. No se modificó la conexión de Producción ni se desplegó este PR allí.

## Seguridad y dependencias

Se actualizaron Next.js/ESLint Next a **16.4.6**, React/React DOM/RSC a **19.3.1**, vinext a **1.4.6**, Vite a **8.3.8**, plugin RSC a **0.5.37**, Cloudflare Vite a **1.69.1**, Wrangler a **4.163.0** y sus tipos compatibles. Las actualizaciones son las necesarias para quitar avisos del árbol de producción y desarrollo. `fflate` se fija mediante override a **0.7.5**, parche compatible de la rama 0.7 requerido por Satori; evita la regresión a vinext 0.2.1 que proponía audit force. Se actualizaron las dependencias transitivas compatibles sin usar `--force` ni ignorar peers.

`npm audit` completo: **0 vulnerabilidades** (incluido desarrollo). Se comprobaron compilaciones Next.js y vinext tras actualizar.

CSV en `/personal/matriculas/`: elegir/quitar/reordenar columnas, clave `MATRICULA_EXPORT_TOKEN` validada en servidor, valores SQL parametrizados, lista fija de columnas, BOM UTF-8, comillas escapadas, fórmulas neutralizadas y `no-store`. No se guarda la clave en URL ni almacenamiento del navegador. Máximo 10.000 registros; excederlo falla explícitamente sin truncar datos. La clave compartida no reemplaza cuentas nominativas/auditoría individual.

## Pendientes ajenos a estos cambios

- Configurar y distribuir de forma segura `MATRICULA_EXPORT_TOKEN` en Production antes de habilitar exportaciones; Preview ya tiene una clave limitada a esta rama. No se incluyó ningún secreto en Git.
- El rol de inicialización necesita CREATE SCHEMA/TABLE y ALTER TABLE, además de INSERT/SELECT. Para permisos mínimos, provisionar esquema/columnas con rol de migración y adaptar la inicialización antes de restringir el rol de aplicación.
- El enlace «EXTRACTO DEL REGLAMENTO INTERNO» aún abre el reglamento completo: falta el archivo específico.
- Vercel Authentication sigue protegiendo los dominios Vercel según la configuración existente. Confirmar el dominio público para la apertura de matrícula. No se cambió protección ni se concedió acceso público.
- Las fichas ficticias de la primera ronda no se eliminaron ni trasladaron; no se confundieron con datos reales para una limpieza automática.
- GitHub Pages sigue como publicación manual y deriva el guardado al sitio Vercel. Nunca ejecuta estas rutas de servidor.

## Evidencia de pruebas

- 11 pruebas unitarias: validación compartida, obligatoriedad, suplente IPA, resolución de retiro, negativos/No aplica, CSV y destinos de datos separados.
- `npm run build:pages`: Next.js y TypeScript aprobados.
- `npm run build`: vinext aprobado.
- `npm run lint`: sin errores; 12 advertencias preexistentes por imágenes HTML.
- Navegador local: título y desplazamiento, convivencia con selección conservada, campos obligatorios, ambas listas por rol, suplente IPA, retiro precargado y botón verde de mayor tamaño. Error de conexión simulado exclusivamente para comprobar conservación de la ficha; la prueba de Preview usa Neon real.
- `scripts/matricula-smoke.ts`: prueba explícita con ficha ficticia, lectura posterior CSV, orden/descarga, acceso denegado, reintento idempotente y comprobación del aislamiento. Requiere `MATRICULA_SMOKE=1`, `MATRICULA_TEST_URL`, `MATRICULA_EXPORT_TOKEN` y, si aplica, `MATRICULA_TEST_SHARE_URL`. Escribe una ficha por ejecución. El navegador de pruebas permite `MATRICULA_TEST_IGNORE_HTTPS_ERRORS=1` para el certificado del proxy de este entorno; no cambia TLS de la aplicación.

Resultado de la nueva prueba real: pendiente del Preview de esta revisión.
