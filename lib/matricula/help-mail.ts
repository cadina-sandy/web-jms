import 'server-only';
import nodemailer from 'nodemailer';
import { helpMailText, type HelpRequest } from './help';
const mailbox = 'matriculas.jms@gmail.com';
export async function sendHelpRequest(value: HelpRequest): Promise<boolean> {
  const password = process.env.MATRICULA_GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  // Preview must never send real contact inquiries.
  if (process.env.VERCEL_ENV !== 'production' || !password) return false;
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: mailbox, pass: password },
    connectionTimeout: 6000, greetingTimeout: 6000, socketTimeout: 8000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  try {
    const result = await transport.sendMail({
      from: { name: 'Consultas Pre-Matrícula JMS', address: mailbox },
      to: { name: 'Matrículas JMS', address: mailbox },
      replyTo: { name: value.name, address: value.email },
      subject: 'Consulta de pre-matrícula 2027 | Escuela Julio Montt Salamanca',
      text: helpMailText(value),
    });
    return result.accepted.length > 0;
  } catch {
    console.error('No se pudo enviar la consulta de ayuda (sin datos personales).');
    return false;
  } finally { transport.close(); }
}
