import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-sans', subsets: ['latin'] });
const lora = Lora({ variable: '--font-serif', subsets: ['latin'], style: ['italic'] });

export const metadata: Metadata = {
  title: 'Colegio JMS | Educando para el futuro',
  description: 'Colegio JMS: una comunidad educativa que forma estudiantes integrales, curiosos y comprometidos con su futuro.',
  openGraph: {
    title: 'Colegio JMS | Educando para el futuro',
    description: 'Aprender, crecer y transformar en una comunidad educativa comprometida.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colegio JMS | Educando para el futuro',
    description: 'Aprender, crecer y transformar en una comunidad educativa comprometida.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${inter.variable} ${lora.variable}`}>{children}</body></html>;
}
