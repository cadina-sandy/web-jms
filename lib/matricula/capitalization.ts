/** Capitalizes the first letter of the field and lowercases the remaining text. */
export function enrollmentSentenceCase(value: string): string {
  return value.toLocaleLowerCase('es-CL').replace(/\p{L}/u, letter => letter.toLocaleUpperCase('es-CL'));
}

/** Changes the stored value while preserving the caret when editing mid-text. */
export function capitalizeEnrollmentInput(input: HTMLInputElement | HTMLTextAreaElement, composing = false): void {
  if (composing || input.disabled || input.readOnly || input.hasAttribute('data-email-part')) return;
  if (input.tagName === 'INPUT' && (input as HTMLInputElement).type !== 'text') return;
  const original = input.value;
  const formatted = enrollmentSentenceCase(original);
  if (original === formatted) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const direction = input.selectionDirection ?? undefined;
  input.value = formatted;
  if (start !== null && end !== null) {
    input.setSelectionRange(
      enrollmentSentenceCase(original.slice(0, start)).length,
      enrollmentSentenceCase(original.slice(0, end)).length,
      direction,
    );
  }
}
