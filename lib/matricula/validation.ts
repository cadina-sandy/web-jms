import { enrollmentCourses, fields, householdOptions, type Answers } from './fields';

export function fromForm(data: FormData): Answers {
  const answers: Answers = {};
  for (const field of fields) answers[field] = String(data.get(field) ?? '').trim();
  householdOptions.forEach((option, i) => { answers[`vive${i}` as keyof Answers] = data.getAll('conQuienVive').includes(option) ? 'si' : 'no'; });
  // Accept legacy bracket names while retaining the new flat columns.
  for (let i = 0; i < 10; i++) {
    for (const [suffix, source] of [['Nombre', 'nombre'], ['Telefono', 'telefono'], ['RutNumero', 'rutNumero'], ['RutDigito', 'rutDigito']]) {
      const key = `retiro${i + 1}${suffix}` as keyof Answers;
      if (!answers[key]) answers[key] = String(data.get(`personasAutorizadas[${i}][${source}]`) ?? '').trim();
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
  for (const field of fields) {
    if (/(RutNumero|Ipa|Ipe|^ipe)$/i.test(field) && answers[field]) {
      answers[field] = answers[field]!.replaceAll('.', '');
      if (!/^\d{1,9}$/.test(answers[field]!)) errors[field] = 'Ingresa un número de identificación válido.';
    }
  }
  const required = ['fechaMatricula', 'curso', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'genero', 'tipoIdentificacion', 'nacionalidad', 'direccion', 'comuna', 'numeroPersonasHogar', 'apoderadoNombres', 'apoderadoApellidos', 'apoderadoTipoIdentificacion', 'apoderadoNacionalidad', 'apoderadoParentesco', 'apoderadoCelular', 'apoderadoCorreoUsuario', 'apoderadoCorreoDominio', 'emergenciaContacto', 'emergenciaCelular', 'saludTipoPrevision', 'saludTieneDiagnostico', 'saludConsultorio', 'saludImpedimentoEducacionFisica', 'estudianteNuevo', 'cursoRepetido', 'matriculaRol', 'funcionarioMatricula', 'apoderadoFechaNacimiento', 'apoderadoNivelEducacion', 'apoderadoSituacionLaboral', 'apoderadoLugarTrabajo', 'apoderadoRegistroSocialHogares', 'apoderadoSuplenteAplica', 'saludMedicamentosContraindicadosOAlergias', 'dificultadAprendizaje', 'tratamientoEspecialista', 'programaApoyoFamiliar', 'autorizacionImagenDecision', 'retiroCantidad'];
  function requireField(name: string) { if (!answers[name as keyof Answers]) errors[name] = 'Completa este campo obligatorio.'; }
  required.forEach(requireField);
  if (answers.pertenecePuebloOriginario !== 'si' && answers.pertenecePuebloOriginario !== 'no') {
    errors.pertenecePuebloOriginario = 'Selecciona Sí o No.';
  }
  if (!householdOptions.some((_, i) => answers[`vive${i}` as keyof Answers] === 'si')) errors.conQuienVive = 'Selecciona al menos una opción.';
  for (const [type, rut, digit, alternate, alternateDigit, allowed] of [
    ['tipoIdentificacion', 'rutNumero', 'rutDigito', 'ipe', 'ipeDigito', 'ipe'],
    ['apoderadoTipoIdentificacion', 'apoderadoRutNumero', 'apoderadoRutDigito', 'apoderadoIpa', 'apoderadoIpaDigito', 'ipa'],
  ]) {
    const choice = answers[type as keyof Answers];
    if (choice && !['rut', allowed].includes(choice)) errors[type] = 'Selecciona una identificación válida.';
    if (choice) [choice === 'rut' ? rut : alternate, choice === 'rut' ? digit : alternateDigit].forEach(requireField);
  }
  for (const [user, domain, other] of [
    ['correoUsuario', 'correoDominio', 'correoDominioOtro'],
    ['apoderadoCorreoUsuario', 'apoderadoCorreoDominio', 'apoderadoCorreoDominioOtro'],
  ] as const) {
    const username = answers[user];
    const selectedDomain = answers[domain];
    if (!username && !selectedDomain) continue;

    requireField(user);
    requireField(domain);
    if (username?.includes('@')) errors[user] = 'Escribe solo la parte anterior al @.';
    else if (username && /\s/.test(username)) errors[user] = 'Escribe el usuario del correo sin espacios.';

    const domainField = selectedDomain === 'otra' ? other : domain;
    const domainValue = answers[domainField];
    if (selectedDomain === 'otra') requireField(other);
    if (domainValue?.includes('@')) errors[domainField] = 'Escribe el dominio sin @ (por ejemplo, ejemplo.cl).';
    else if (domainValue && !/^[^@\s.]+(?:\.[^@\s.]+)+$/.test(domainValue)) errors[domainField] = 'Escribe un dominio válido (por ejemplo, ejemplo.cl).';
  }
  for (const name of ['apoderadoCelular', 'emergenciaCelular', 'apoderadoSuplenteCelular']) {
    if (answers[name as keyof Answers] && !/^\d{9}$/.test(answers[name as keyof Answers]!)) errors[name] = 'Ingresa 9 dígitos, sin +56.';
  }
  for (const name of ['fechaMatricula', 'fechaNacimiento', 'apoderadoFechaNacimiento']) {
    const date = answers[name as keyof Answers];
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) errors[name] = 'Ingresa una fecha válida.';
  }
  if (answers.curso && !enrollmentCourses.includes(answers.curso)) errors.curso = 'Selecciona un curso válido.';
  for (const [name, choice, detail] of [
    ['emergenciaContacto', 'otro', 'emergenciaContactoOtro'], ['funcionarioMatricula', 'otro', 'funcionarioMatriculaOtro'],
    ['saludTipoPrevision', 'otra', 'saludOtraPrevision'], ['saludTieneDiagnostico', 'si', 'saludDetalleDiagnostico'],
    ['saludConsultorio', 'otro', 'saludOtroConsultorio'], ['cursoRepetido', 'si', 'cantidadCursosRepetidos'], ['estudianteNuevo', 'si', 'colegioProcedencia'],
  ]) { if (answers[name as keyof Answers] === choice) requireField(detail); else answers[detail as keyof Answers] = ''; }
  if (answers.emergenciaContacto === 'apoderado-suplente' && answers.apoderadoSuplenteAplica !== 'si') errors.emergenciaContacto = 'No hay suplente en esta ficha.';
  if (['si', 'no'].includes(answers.autorizacionImagenDecision || '') && answers.autorizacionImagenApoderado === 'apoderado-suplente' && answers.apoderadoSuplenteAplica !== 'si') errors.autorizacionImagenApoderado = 'No hay suplente en esta ficha.';
  if (answers.matriculaRol === 'funcionario' && answers.funcionarioMatricula && !['Paula Santander', 'Sandy Cadín', 'Jeannette Montanares', 'Jaime Villalobos', 'otro'].includes(answers.funcionarioMatricula)) errors.funcionarioMatricula = 'Selecciona un funcionario o «Otro».';
  if (!['funcionario', 'apoderado'].includes(answers.matriculaRol || '')) errors.matriculaRol = 'Selecciona quién realiza la matrícula.';
  if (answers.matriculaRol === 'apoderado' && answers.funcionarioMatricula !== 'otro') {
    const names = [[answers.apoderadoNombres, answers.apoderadoApellidos].filter(Boolean).join(' '), answers.apoderadoSuplenteAplica === 'si' ? answers.apoderadoSuplenteNombreCompleto : ''];
    if (answers.funcionarioMatricula === 'apoderado') answers.funcionarioMatricula = names[0];
    if (answers.funcionarioMatricula === 'apoderado-suplente') answers.funcionarioMatricula = names[1];
    if (!names.filter(Boolean).includes(answers.funcionarioMatricula)) errors.funcionarioMatricula = 'Selecciona un apoderado de esta ficha.';
  }
  if (!['si', 'no-aplica'].includes(answers.apoderadoSuplenteAplica || '')) errors.apoderadoSuplenteAplica = 'Indica si tiene suplente.';
  if (answers.apoderadoSuplenteAplica === 'si') {
    ['apoderadoSuplenteNombreCompleto', 'apoderadoSuplenteParentesco', 'apoderadoSuplenteCelular', 'apoderadoSuplenteTipoIdentificacion'].forEach(requireField);
    const type = answers.apoderadoSuplenteTipoIdentificacion;
    if (!['rut', 'ipa'].includes(type || '')) errors.apoderadoSuplenteTipoIdentificacion = 'Selecciona RUT o IPA.';
    (type === 'rut' ? ['apoderadoSuplenteRutNumero', 'apoderadoSuplenteRutDigito'] : ['apoderadoSuplenteIpa', 'apoderadoSuplenteIpaDigito']).forEach(requireField);
  } else {
    for (const key of fields) if (key.startsWith('apoderadoSuplente') && key !== 'apoderadoSuplenteAplica') answers[key] = '';
  }
  if (!['si', 'no'].includes(answers.autorizacionImagenDecision || '')) errors.autorizacionImagenDecision = 'Indica si autoriza o no el uso de imagen.';
  if (['si', 'no'].includes(answers.autorizacionImagenDecision || '')) ['autorizacionImagenApoderado', 'autorizacionImagenFirma', 'autorizacionImagenFecha'].forEach(requireField);
  else ['autorizacionImagenApoderado', 'autorizacionImagenFirma', 'autorizacionImagenFecha'].forEach(key => { answers[key as keyof Answers] = ''; });
  const count = Number(answers.retiroCantidad);
  if (!Number.isInteger(count) || count < 1 || count > 10) errors.retiroCantidad = 'Debe indicar entre una y diez personas.';
  for (let i = 1; i <= 10; i++) {
    const prefix = `retiro${i}`;
    const get = (suffix: string) => answers[`${prefix}${suffix}` as keyof Answers];
    const set = (suffix: string, value: string) => { answers[`${prefix}${suffix}` as keyof Answers] = value; };
    if (i > count) {
      for (const suffix of ['Origen','Nombre','Telefono','TipoIdentificacion','RutNumero','RutDigito','Ipa','IpaDigito']) set(suffix, '');
      continue;
    }
    requireField(`${prefix}Origen`);
    const source = get('Origen');
    if (source === 'apoderado' || source === 'apoderado-suplente') {
      const guardian = source === 'apoderado' ? 'apoderado' : 'apoderadoSuplente';
      if (source === 'apoderado-suplente' && answers.apoderadoSuplenteAplica !== 'si') errors[`${prefix}Origen`] = 'No hay apoderado suplente en esta ficha.';
      set('Nombre', guardian === 'apoderado' ? [answers.apoderadoNombres, answers.apoderadoApellidos].filter(Boolean).join(' ') : answers.apoderadoSuplenteNombreCompleto || '');
      set('Telefono', answers[`${guardian}Celular` as keyof Answers] || '');
      for (const suffix of ['TipoIdentificacion','RutNumero','RutDigito','Ipa','IpaDigito']) set(suffix, answers[`${guardian}${suffix}` as keyof Answers] || '');
    } else if (source === 'otro') {
      ['Nombre', 'Telefono', 'TipoIdentificacion'].forEach(suffix => requireField(`${prefix}${suffix}`));
      if (!['rut','ipa'].includes(get('TipoIdentificacion') || '')) errors[`${prefix}TipoIdentificacion`] = 'Selecciona RUT o IPA.';
      (get('TipoIdentificacion') === 'rut' ? ['RutNumero','RutDigito'] : ['Ipa','IpaDigito']).forEach(suffix => requireField(`${prefix}${suffix}`));
      if (get('Telefono') && !/^\d{9}$/.test(get('Telefono')!)) errors[`${prefix}Telefono`] = 'Ingresa 9 dígitos.';
    } else errors[`${prefix}Origen`] = 'Selecciona una persona o «Otro».';
  }
  return { answers, errors };
}
