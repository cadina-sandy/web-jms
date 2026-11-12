'use client';

import { useEffect, useState } from 'react';
const publicPath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const reservationHref = `${publicPath}/reserva-matricula/`;

// Carrusel principal: banner de admisión y mensajes destacados.
const homeSlides = [
  { image: `${publicPath}/admision-2027-banner.png`, title: 'Admisión escolar 2027', action: 'Admisiones 2027', href: reservationHref, admission: true },
  { image: 'https://www.uc.cl/site/assets/files/25026/escolares-sala-clases.jpg', eyebrow: 'Excelencia académica', title: 'Cada talento encuentra su camino', text: 'Acompañamiento cercano, altas expectativas y oportunidades para descubrir nuevas capacidades.', action: 'Ver resultados', href: '#resultados' },
  { image: 'https://portaluchile.uchile.cl/dam/jcr%3A669ccedf-6450-4fad-bb89-46f4872922f2/Ciae-03-L.jpg', eyebrow: 'Vida escolar', title: 'Una comunidad que inspira', text: 'Convivencia, deporte, arte y aprendizaje se encuentran todos los días en nuestra escuela.', action: 'Descubre más', href: '#comunidad' },
];

const reservationSlide = {
  image: `${publicPath}/reserva-matricula-banner.png`,
  title: 'Reserva tu matricula',
  action: 'Ver información de matrícula',
  href: '#informacion-matricula',
  admission: true as const,
};

export default function HeroCarousel({ reservation = false }: { reservation?: boolean }) {
  const slides = reservation ? [reservationSlide, ...homeSlides.slice(1)] : homeSlides;
  const slideCount = slides.length;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % slideCount), 6000);
    return () => window.clearInterval(timer);
  }, [slideCount]);

  const move = (direction: number) => setCurrent((value) => (value + direction + slideCount) % slideCount);

  return (
    <section className="hero" id="inicio" aria-label="Información destacada">
      {slides.map((slide, index) => (
        <article
          className={`slide ${slide.admission ? 'admission-slide' : ''} ${index === current ? 'active' : ''}`}
          key={slide.title}
          aria-hidden={index !== current}
        >
          {slide.admission ? (
            <a className="admission-slide-link" href={slide.href} tabIndex={index === current ? undefined : -1}>
              <img src={slide.image} alt={reservation ? slide.title : ""} />
              <div className="hero-overlay" />
              <div className="shell hero-content">
                <span className="hero-btn">{slide.action} <span aria-hidden="true">→</span></span>
              </div>
            </a>
          ) : (
            <>
              <img src={slide.image} alt="Estudiantes participando en una jornada escolar" />
              <div className="hero-overlay" />
              <div className="shell hero-content">
                <div className="eyebrow"><span />{slide.eyebrow}</div>
                <h1>{slide.title}</h1>
                <p>{slide.text}</p>
                <a className="hero-btn" href={reservation ? `${publicPath}/${slide.href}` : slide.href} tabIndex={index === current ? undefined : -1}>{slide.action} <span>↗</span></a>
              </div>
            </>
          )}
        </article>
      ))}
      <div className="shell hero-controls"><button onClick={()=>move(-1)} aria-label="Imagen anterior">←</button><div className="dots">{slides.map((slide,index)=><button key={slide.title} className={index===current?'active':''} onClick={()=>setCurrent(index)} aria-label={`Ver imagen ${index+1}`}/>)}</div><button onClick={()=>move(1)} aria-label="Imagen siguiente">→</button></div><div className="scroll-note"><span/> DESCUBRE MÁS</div>
    </section>
  );
}
