import type { Metadata } from 'next';
import SiteHeader from '../SiteHeader';
import ReservationSteps from './ReservationSteps';

export const metadata: Metadata = {
  title: 'Reserva tu matricula | Escuela Julio Montt Salamanca',
};

export default function ReservationPage() {
  return (
    <main>
      <SiteHeader />
      <ReservationSteps checksAddresses={Boolean(process.env.GEOAPIFY_API_KEY?.trim())} />
    </main>
  );
}
