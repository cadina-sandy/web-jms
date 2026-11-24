export function validEnrollmentSelection(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 10000
    && value.every(id => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    && new Set(value).size === value.length;
}
