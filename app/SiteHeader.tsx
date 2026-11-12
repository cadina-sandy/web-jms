'use client';

import { useState } from 'react';

const publicPath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const reservationHref = `${publicPath}/reserva-matricula/`;

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <>
    {/* Barra institucional superior: valores y ubicación. */}
    <div className="topbar"><div className="shell topbar-inner"><span>Respeto, esfuerzo y resiliencia</span><div><span>Pedro Prado 4375</span><i/><span>Macul, Santiago</span></div></div></div>

    {/* Encabezado principal: logo, navegación y acceso a la reserva de matrícula. */}
    <header className="site-header"><div className="shell nav-wrap">
      <a className="brand" href={`${publicPath}/#inicio`} aria-label="Escuela Julio Montt Salamanca, ir al inicio"><img src={`${publicPath}/logo-jms.png`} alt="Escudo de la Escuela Julio Montt Salamanca"/><span><strong>Escuela Julio Montt<br/>Salamanca</strong><small>Preparado para la vida</small></span></a>
      <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>{menuOpen ? '×' : '☰'}</button>
      <nav className={menuOpen ? 'open' : ''} aria-label="Navegación principal">
        <a href={`${publicPath}/#inicio`} onClick={() => setMenuOpen(false)}>Inicio</a>
        <div className="nav-group"><a href={`${publicPath}/#nuestra-escuela`} onClick={() => setMenuOpen(false)}>Nuestra escuela <span>⌄</span></a><div className="dropdown"><a href={`${publicPath}/#mision`} onClick={() => setMenuOpen(false)}>Misión y visión</a><a href={`${publicPath}/#resultados`} onClick={() => setMenuOpen(false)}>Resultados académicos</a></div></div>
        <a href={`${publicPath}/#noticias`} onClick={() => setMenuOpen(false)}>Noticias</a><a href={`${publicPath}/#galeria`} onClick={() => setMenuOpen(false)}>Galería</a><a href={`${publicPath}/#comunidad`} onClick={() => setMenuOpen(false)}>Comunidad</a><a href={`${publicPath}/#contacto`} onClick={() => setMenuOpen(false)}>Contacto</a><a className="mobile-admission" href={reservationHref} onClick={() => setMenuOpen(false)}>Reserva tu matricula</a>
      </nav><a className="admission-btn" href={reservationHref}>Reserva tu matricula <span aria-hidden="true">→</span></a>
    </div></header>
  </>;
}
