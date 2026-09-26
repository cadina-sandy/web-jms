import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-sans', subsets: ['latin'] });
const lora = Lora({ variable: '--font-serif', subsets: ['latin'], style: ['italic'] });

export const metadata: Metadata = {
  title: 'Escuela Julio Montt Salamanca | Preparado para la vida',
  description: 'Escuela Julio Montt Salamanca de Macul: 64 años entregando una educación integral, laica e inclusiva.',
  openGraph: {
    title: 'Escuela Julio Montt Salamanca | Preparado para la vida',
    description: '64 años de trayectoria formando estudiantes en una comunidad educativa integral e inclusiva.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escuela Julio Montt Salamanca | Preparado para la vida',
    description: '64 años de trayectoria formando estudiantes en una comunidad educativa integral e inclusiva.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${inter.variable} ${lora.variable}`}>{children}</body></html>;
}
