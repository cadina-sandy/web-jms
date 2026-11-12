import type { Metadata } from 'next';
import HeroCarousel from '../HeroCarousel';
import SiteHeader from '../SiteHeader';
import ReservationSteps from './ReservationSteps';

export const metadata: Metadata = {
  title: 'Reserva tu matricula | Escuela Julio Montt Salamanca',
};

export default function ReservationPage() {
  return (
    <main>
      <SiteHeader />
      <HeroCarousel reservation />
      <section className="quick-links" id="informacion-matricula" aria-label="Información de matrícula">
        <div className="shell quick-grid reservation-quick-grid">
          <a href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer">
            <b aria-hidden="true">01</b>
            <span><small>INFORMACIÓN DE</small>Admisión y matrícula</span>
            <i aria-hidden="true">↗</i>
          </a>
          <div className="quick-link-pending">
            <b aria-hidden="true">02</b>
            <span>Completa el formulario</span>
          </div>
        </div>
      </section>
      <ReservationSteps />
    </main>
  );
}
