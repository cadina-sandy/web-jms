/** Changes the entered value itself, preserving the caret when editing mid-text. */
export function uppercaseEnrollmentInput(input: HTMLInputElement | HTMLTextAreaElement, composing = false): void {
  if (composing || input.disabled || input.readOnly || input.hasAttribute('data-email-part')) return;
  if (input.tagName === 'INPUT' && (input as HTMLInputElement).type !== 'text') return;
  const original = input.value;
  const uppercase = original.toLocaleUpperCase('es-CL');
  if (original === uppercase) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const direction = input.selectionDirection ?? undefined;
  input.value = uppercase;
  if (start !== null && end !== null) {
    input.setSelectionRange(
      original.slice(0, start).toLocaleUpperCase('es-CL').length,
      original.slice(0, end).toLocaleUpperCase('es-CL').length,
      direction,
    );
  }
}
