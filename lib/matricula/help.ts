export type HelpRequest = { name: string; email: string; phone: string; question: string; website: string };
export const helpQuestionLimit = 280;
export function validateHelpRequest(input: unknown): { value: HelpRequest; errors: Record<string, string> } {
  const value: HelpRequest = { name: '', email: '', phone: '', question: '', website: '' };
  const errors: Record<string, string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { value, errors: { form: 'Revisa los datos de la consulta.' } };
  for (const key of Object.keys(value) as (keyof HelpRequest)[]) {
    const raw = (input as Record<string, unknown>)[key];
    if (raw !== undefined && typeof raw !== 'string') errors[key] = 'Ingresa texto válido.';
    else value[key] = typeof raw === 'string' ? raw.trim() : '';
  }
  if (!value.name || value.name.length > 100 || /[\r\n\x00]/.test(value.name)) errors.name = 'Ingresa tu nombre completo (máximo 100 caracteres).';
  if (value.email.length > 150 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value.email)) errors.email = 'Ingresa un correo válido.';
  if (!/^[+\d ()-]{8,20}$/.test(value.phone) || value.phone.replace(/\D/g, '').length < 8) errors.phone = 'Ingresa un teléfono de contacto válido.';
  if (!value.question || value.question.length > helpQuestionLimit || value.question.includes('\0')) errors.question = 'Escribe tu duda en un máximo de 280 caracteres.';
  if (value.website.length > 200) errors.website = 'Solicitud inválida.';
  return { value, errors };
}
export function helpMailText(value: HelpRequest) {
  return ['Nueva consulta de pre-matrícula 2027', '', `Nombre: ${value.name}`, `Correo: ${value.email}`, `Teléfono: ${value.phone}`, '', 'Duda:', value.question].join('\n');
}
