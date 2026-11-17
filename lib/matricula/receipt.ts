import 'server-only';
import nodemailer from 'nodemailer';
import { claimReceiptDelivery } from './db';

const sender = 'matriculas.jms@gmail.com';

export type EnrollmentReceipt = {
  recipient: string;
  date: string;
  course: string;
  sent: boolean;
  retryAllowed: boolean;
};

export async function sendEnrollmentReceipt(id: string, receipt: EnrollmentReceipt) {
  if (receipt.sent) return 'sent';
  const password = process.env.MATRICULA_GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  const testRecipient = process.env.MATRICULA_RECEIPT_TEST_TO?.trim() || sender;
  const production = process.env.VERCEL_ENV === 'production';
  if (!password || (!production && testRecipient.toLowerCase() !== receipt.recipient.toLowerCase())) {
    return 'unavailable';
  }
  if (!receipt.retryAllowed || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(receipt.recipient)) {
    return 'failed';
  }

  try {
    if (!await claimReceiptDelivery(id)) return 'failed';

    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: sender, pass: password },
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    const delivery = await transport.sendMail({
      from: { name: 'Escuela Julio Montt Salamanca', address: sender },
      to: { name: '', address: receipt.recipient },
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
        'Este correo se generó automáticamente. Por favor, no respondas a este mensaje.',
        '',
        'Escuela Julio Montt Salamanca',
      ].join('\n'),
    });
    if (delivery.accepted.length > 0) return 'sent';
  } catch {
    // An SMTP failure does not undo the saved enrollment.
  }
  console.error('No se pudo enviar el comprobante de matrícula (sin datos personales).');
  return 'failed';
}
