export const enrollmentClickEvents = {
  click_inscribir_alumno: 'INSCRIBIR ALUMNO',
  click_pre_matricula_2027: 'PRE-MATRÍCULA 2027 AQUÍ',
} as const;
export type EnrollmentClickEvent = keyof typeof enrollmentClickEvents;
export type EnrollmentClickCount = { event: EnrollmentClickEvent; count: number };
export function isEnrollmentClick(value: unknown): value is { event: EnrollmentClickEvent; id: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return Object.keys(body).length === 2 && typeof body.event === 'string'
    && Object.hasOwn(enrollmentClickEvents, body.event) && typeof body.id === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id);
}
