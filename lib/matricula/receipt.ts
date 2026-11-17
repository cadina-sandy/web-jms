import 'server-only';

export type EnrollmentReceipt = {
  recipient: string;
  date: string;
  course: string;
  sent: boolean;
  retryAllowed: boolean;
};

export async function sendEnrollmentReceipt(id: string, receipt: EnrollmentReceipt) {
  if (receipt.sent) return 'sent';
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MATRICULA_RECEIPT_FROM;
  const testRecipient = process.env.MATRICULA_RECEIPT_TEST_TO;
  const production = process.env.VERCEL_ENV === 'production';
  if (!apiKey || !from || (!production && (!testRecipient || testRecipient !== receipt.recipient))) {
    return 'unavailable';
  }
  if (!receipt.recipient || !receipt.retryAllowed) return 'failed';

  const body = JSON.stringify({
    from,
    to: [receipt.recipient],
    subject: 'Comprobante de matrícula 2027 | Escuela Julio Montt Salamanca',
    text: [
      'Hola,',
      '',
      'La ficha de matrícula 2027 se registró correctamente.',
      '',
      `Fecha de matrícula: ${receipt.date.split('-').reverse().join('/')}`,
      `Curso: ${receipt.course}`,
      `Número de comprobante: ${id}`,
      '',
      'Guarda este correo como comprobante del registro. Recuerda el paso de firma presencial indicado por el colegio.',
      '',
      'Escuela Julio Montt Salamanca',
    ].join('\n'),
  });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `matricula-2027/${id}`,
      },
      body,
      signal: AbortSignal.timeout(6000),
    });
    if (response.ok) return 'sent';
  } catch {
    // The saved enrollment remains valid if the provider is unreachable.
  }
  console.error('No se pudo enviar el comprobante de matrícula (sin datos personales).');
  return 'failed';
}
