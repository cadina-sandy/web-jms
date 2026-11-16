import { fields, householdOptions, type Answers } from './fields';

export function fromForm(data: FormData): Answers {
  const answers: Answers = {};
  for (const field of fields) answers[field] = String(data.get(field) ?? '').trim();
  householdOptions.forEach((option, i) => { answers[`vive${i}` as keyof Answers] = data.getAll('conQuienVive').includes(option) ? 'si' : 'no'; });
  for (let i = 0; i < 10; i++) {
    for (const [suffix, source] of [['Nombre', 'nombre'], ['Telefono', 'telefono'], ['RutNumero', 'rutNumero'], ['RutDigito', 'rutDigito']]) {
      answers[`retiro${i + 1}${suffix}` as keyof Answers] = String(data.get(`personasAutorizadas[${i}][${source}]`) ?? '').trim();
    }
  }
  return answers;
}

export function validate(input: unknown): { answers: Answers; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const answers: Answers = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { answers, errors: { nombres: 'Ficha inválida.' } };
  for (const field of fields) {
    const value = (input as Record<string, unknown>)[field];
    if (value !== undefined && (typeof value !== 'string' || value.length > 2000)) errors[field] = 'Máximo 2000 caracteres de texto.';
    else answers[field] = typeof value === 'string' ? value.trim() : '';
  }
  const required = ['fechaMatricula', 'curso', 'nombres', 'apellidoPaterno', 'fechaNacimiento', 'genero', 'tipoIdentificacion', 'nacionalidad', 'direccion', 'comuna', 'numeroPersonasHogar', 'apoderadoNombres', 'apoderadoApellidos', 'apoderadoTipoIdentificacion', 'apoderadoNacionalidad', 'apoderadoParentesco', 'apoderadoCelular', 'apoderadoCorreoUsuario', 'apoderadoCorreoDominio', 'emergenciaContacto', 'emergenciaCelular', 'saludTipoPrevision', 'saludTieneDiagnostico', 'saludConsultorio', 'saludImpedimentoEducacionFisica', 'estudianteNuevo', 'cursoRepetido', 'funcionarioMatricula'];
  function requireField(name: string) { if (!answers[name as keyof Answers]) errors[name] = 'Completa este campo obligatorio.'; }
  required.forEach(requireField);
  for (const [type, rut, digit, alternate, alternateDigit, allowed] of [
    ['tipoIdentificacion', 'rutNumero', 'rutDigito', 'ipe', 'ipeDigito', 'ipe'],
    ['apoderadoTipoIdentificacion', 'apoderadoRutNumero', 'apoderadoRutDigito', 'apoderadoIpa', 'apoderadoIpaDigito', 'ipa'],
  ]) {
    const choice = answers[type as keyof Answers];
    if (choice && !['rut', allowed].includes(choice)) errors[type] = 'Selecciona una identificación válida.';
    if (choice) [choice === 'rut' ? rut : alternate, choice === 'rut' ? digit : alternateDigit].forEach(requireField);
  }
  for (const prefix of ['', 'apoderado']) {
    const user = prefix ? 'apoderadoCorreoUsuario' : 'correoUsuario';
    const domain = prefix ? 'apoderadoCorreoDominio' : 'correoDominio';
    const other = `${domain}Otro` as keyof Answers;
    if (answers[user] || answers[domain]) {
      requireField(user); requireField(domain);
      if (answers[domain] === 'otra') requireField(other);
      const email = `${answers[user]}@${answers[domain] === 'otra' ? answers[other] : answers[domain]}`;
      if (!/^[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+$/.test(email)) errors[answers[domain] === 'otra' ? other : user] = 'Escribe un correo válido.';
    }
  }
  for (const name of ['apoderadoCelular', 'emergenciaCelular', 'apoderadoSuplenteCelular']) {
    if (answers[name as keyof Answers] && !/^\d{9}$/.test(answers[name as keyof Answers]!)) errors[name] = 'Ingresa 9 dígitos, sin +56.';
  }
  for (const name of ['fechaMatricula', 'fechaNacimiento', 'apoderadoFechaNacimiento']) {
    const date = answers[name as keyof Answers];
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) errors[name] = 'Ingresa una fecha válida.';
  }
  const courses = ['Pre-kínder', 'Kínder', ...Array.from({length: 8}, (_, i) => ['A', 'B'].map(s => `${i + 1}°${s}`)).flat()];
  if (answers.curso && !courses.includes(answers.curso)) errors.curso = 'Selecciona un curso válido.';
  for (const [name, choice, detail] of [
    ['emergenciaContacto', 'otro', 'emergenciaContactoOtro'], ['funcionarioMatricula', 'otro', 'funcionarioMatriculaOtro'],
    ['saludTipoPrevision', 'otra', 'saludOtraPrevision'], ['saludTieneDiagnostico', 'si', 'saludDetalleDiagnostico'],
    ['saludConsultorio', 'otro', 'saludOtroConsultorio'], ['cursoRepetido', 'si', 'cantidadCursosRepetidos'], ['estudianteNuevo', 'si', 'colegioProcedencia'],
  ]) { if (answers[name as keyof Answers] === choice) requireField(detail); else answers[detail as keyof Answers] = ''; }
  // Do not silently accept a partial authorization or a partial pickup contact.
  if (answers.autorizacionImagenApoderado || answers.autorizacionImagenFirma) ['autorizacionImagenApoderado', 'autorizacionImagenFirma', 'autorizacionImagenFecha'].forEach(requireField);
  for (let i = 1; i <= 10; i++) {
    const keys = ['Nombre', 'Telefono', 'RutNumero', 'RutDigito'].map(s => `retiro${i}${s}`);
    if (keys.some(k => answers[k as keyof Answers])) keys.forEach(requireField);
  }
  return { answers, errors };
}
