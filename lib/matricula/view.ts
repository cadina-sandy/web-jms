import { fields, householdOptions, type Answers, type Field } from './fields';
import { labels } from './labels';

export const pageSize = 25;
export type EnrollmentSummary = Pick<Answers, 'fechaMatricula' | 'curso' | 'nombres' | 'apellidoPaterno' | 'apellidoMaterno'> & { id: string; numero_ficha?: string | number };
export type EnrollmentRecord = Answers & { id: string; numero_ficha?: string | number };

const sectionStarts = [
  ['nombres', 'Datos del estudiante'],
  ['apoderadoNombres', 'Apoderado principal'],
  ['apoderadoSuplenteAplica', 'Apoderado suplente'],
  ['emergenciaContacto', 'Contacto de emergencia'],
  ['retiroCantidad', 'Personas autorizadas para retiro'],
  ['saludTipoPrevision', 'Datos de salud'],
  ['estudianteNuevo', 'Antecedentes escolares'],
  ['matriculaRol', 'Responsable de la matrícula'],
  ['autorizacionImagenDecision', 'Autorización de uso de imagen'],
] as const satisfies ReadonlyArray<readonly [Field, string]>;

const displayValues: Record<string, string> = {
  si: 'Sí', no: 'No', 'no-aplica': 'No aplica',
  'prefiero-no-responder': 'Prefiero no responder',
  'no-binario': 'No binario', ipa: 'IPA', ipe: 'IPE', rut: 'RUT',
  'santa-julia': 'Santa Julia', 'felix-de-amesti': 'Dr. Félix de Amesti',
  'padre-alberto-hurtado': 'Padre Alberto Hurtado', 'centro-privado': 'Centro Privado',
  'apoderado': 'Apoderado principal', 'apoderado-suplente': 'Apoderado suplente',
  funcionario: 'Funcionario JMS', fonasa: 'Fonasa', isapre: 'Isapre', otro: 'Otro', otra: 'Otra',
};

const friendlyLabels: Partial<Record<Field, string>> = {
  apoderadoNombres: 'Nombres', apoderadoApellidos: 'Apellidos', apoderadoCelular: 'Celular',
  apoderadoFechaNacimiento: 'Fecha de nacimiento', apoderadoNivelEducacion: 'Nivel de educación',
  apoderadoSituacionLaboral: 'Situación laboral', apoderadoLugarTrabajo: 'Lugar de trabajo',
  apoderadoRegistroSocialHogares: 'Registro Social de Hogares', apoderadoSuplenteNombreCompleto: 'Nombre completo',
  apoderadoSuplenteCelular: 'Celular', emergenciaContacto: 'Avisar a', emergenciaCelular: 'Celular',
  saludTipoPrevision: 'Previsión de salud', saludOtraPrevision: 'Otra previsión', saludTieneDiagnostico: 'Diagnóstico médico',
  saludMedicamentosContraindicadosOAlergias: 'Medicamentos contraindicados o alergias alimentarias',
  saludImpedimentoEducacionFisica: 'Impedimento para Educación Física', tratamientoEspecialista: 'Atención por especialista',
  programaApoyoFamiliar: 'Programa de apoyo familiar', funcionarioMatricula: 'Nombre de quien matricula',
  funcionarioMatriculaOtro: 'Otro nombre', autorizacionImagenFirma: 'Firma',
};

export function enrollmentNumber(record: { numero_ficha?: string | number }) {
  const number = String(record.numero_ficha ?? '');
  return /^[1-9]\d*$/.test(number) ? number : '—';
}

export function enrollmentName(record: EnrollmentSummary) {
  return [record.nombres, record.apellidoPaterno, record.apellidoMaterno]
    .filter(value => value?.trim() && !/^no[ -]aplica$/i.test(value.trim())).join(' ') || 'Estudiante';
}

export function enrollmentDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').reverse().join('/') : value;
}

export function enrollmentSections(record: EnrollmentRecord) {
  return sectionStarts.map(([first, title], index) => {
    const next = sectionStarts[index + 1]?.[0];
    const sectionFields = fields.slice(fields.indexOf(first), next ? fields.indexOf(next) : fields.length);
    const entries = sectionFields.flatMap<{ key: Field; label: string; value: string }>(field => {
      if (field === 'vive0') {
        const value = householdOptions.filter((_, i) => record[`vive${i}` as Field] === 'si').join(', ');
        return value ? [{ key: field, label: 'Vive con', value }] : [];
      }
      if (/^vive\d$/.test(field) || /CorreoDominio|^correoDominio/.test(field)) return [];
      if (field === 'correoUsuario' || field === 'apoderadoCorreoUsuario') {
        const student = field === 'correoUsuario';
        const user = record[field];
        const selected = student ? record.correoDominio : record.apoderadoCorreoDominio;
        const domain = selected === 'otra' ? (student ? record.correoDominioOtro : record.apoderadoCorreoDominioOtro) : selected;
        const value = [user, domain].filter(Boolean).join('@');
        return value ? [{ key: field, label: 'Correo', value }] : [];
      }
      const value = record[field]?.trim();
      if (!value) return [];
      const label = friendlyLabels[field] ?? labels[field].replace(/^(Estudiante|Apoderado|Suplente|Imagen):\s*/, '');
      return [{ key: field, label, value: Object.hasOwn(displayValues, value) ? displayValues[value] : enrollmentDate(value) }];
    });
    return { title, entries };
  }).filter(section => section.entries.length > 0);
}

