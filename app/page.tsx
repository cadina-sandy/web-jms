'use client';

import { useEffect, useState } from 'react';

const publicPath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Carrusel principal: banner de admisión y mensajes destacados.
const slides = [
  { image: `${publicPath}/admision-2027-banner.png`, eyebrow: 'Proceso de admisión', title: 'Admisión escolar 2027', text: 'Infórmate y realiza tu postulación en el Sistema de Admisión Escolar.', action: 'Admisiones 2027', href: 'https://www.sistemadeadmisionescolar.cl/', external: true, admission: true },
  { image: 'https://www.uc.cl/site/assets/files/25026/escolares-sala-clases.jpg', eyebrow: 'Excelencia académica', title: 'Cada talento encuentra su camino', text: 'Acompañamiento cercano, altas expectativas y oportunidades para descubrir nuevas capacidades.', action: 'Ver resultados', href: '#resultados' },
  { image: 'https://portaluchile.uchile.cl/dam/jcr%3A669ccedf-6450-4fad-bb89-46f4872922f2/Ciae-03-L.jpg', eyebrow: 'Vida escolar', title: 'Una comunidad que inspira', text: 'Convivencia, deporte, arte y aprendizaje se encuentran todos los días en nuestra escuela.', action: 'Descubre más', href: '#comunidad' },
];

// Noticias y fechas mostradas en la página de inicio.
const news = [
  { day: '18', month: 'MAR', tag: 'COMUNIDAD', title: 'Inicio de talleres extracurriculares 2026' },
  { day: '24', month: 'MAR', tag: 'ACADÉMICO', title: 'Primera reunión de apoderados del año' },
  { day: '05', month: 'ABR', tag: 'DEPORTE', title: 'Encuentro deportivo interescolar' },
];

// Mini galería ubicada junto a la sección "Sigamos conectados".
// Estas fotografías son muestras distintas de las portadas usadas en "Nuestra galería".
const communityGallery = [
  { image: `${publicPath}/gallery/dia-del-sindrome-de-down/20260320_093525.jpg`, alt: 'Actividad de la comunidad escolar por el Día del Síndrome de Down' },
  { image: `${publicPath}/gallery/ajedrez-2026/ajedrez-10.jpg`, alt: 'Estudiantes participando en una actividad de ajedrez' },
  { image: `${publicPath}/gallery/dia-del-libro/20260422_130030.jpg`, alt: 'Celebración escolar del Día del Libro' },
];

// Portadas de "Nuestra galería" tomadas de cinco secciones reales de /galeria/.
// Cada portada dirige a la galería completa en una pestaña nueva.
const galleryAlbums = [
  { title: 'Deporte', subtitle: 'Campeonato de Voleibol 2026', cover: `${publicPath}/gallery/voleibol-2026/20260611_133801.jpg` },
  { title: 'Deporte', subtitle: 'Campeonato de Ajedrez 2026', cover: `${publicPath}/gallery/ajedrez-2026/ajedrez-06.jpg` },
  { title: 'Lectura', subtitle: 'Día del Libro', cover: `${publicPath}/gallery/dia-del-libro/20260422_121716.jpg` },
  { title: 'Comunidad', subtitle: 'Vista a Bomberos', cover: `${publicPath}/gallery/bomberos/bombero-1.png` },
  { title: 'Inclusión', subtitle: 'Día del Autismo', cover: `${publicPath}/gallery/dia-del-autismo/20260410_092723.jpg` },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const timer = window.setInterval(() => setCurrent((value) => (value + 1) % slides.length), 6000); return () => window.clearInterval(timer); }, []);
  const move = (direction: number) => setCurrent((value) => (value + direction + slides.length) % slides.length);

  // Estructura de la página, en orden:
  // 1. Barra superior y encabezado.
  // 2. Banner principal y accesos rápidos.
  // 3. Nuestra escuela, misión, visión y trayectoria.
  // 4. Resultados académicos y noticias.
  // 5. Galería, comunidad y acceso a Admisión 2027.
  // 6. Ubicación, pie de página y visor ampliado de fotografías.
  return <main>
    {/* Barra institucional superior: valores y ubicación. */}
    <div className="topbar"><div className="shell topbar-inner"><span>Respeto, esfuerzo y resiliencia</span><div><span>Pedro Prado 4375</span><i/><span>Macul, Santiago</span></div></div></div>

    {/* Encabezado principal: logo, navegación y acceso a Admisión 2027. */}
    <header className="site-header"><div className="shell nav-wrap">
      <a className="brand" href="#inicio" aria-label="Escuela Julio Montt Salamanca, ir al inicio"><img src={`${publicPath}/logo-jms.png`} alt="Escudo de la Escuela Julio Montt Salamanca"/><span><strong>Escuela Julio Montt<br/>Salamanca</strong><small>Preparado para la vida</small></span></a>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Abrir menú">{menuOpen ? '×' : '☰'}</button>
      <nav className={menuOpen ? 'open' : ''} aria-label="Navegación principal">
        <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
        <div className="nav-group"><a href="#nuestra-escuela" onClick={() => setMenuOpen(false)}>Nuestra escuela <span>⌄</span></a><div className="dropdown"><a href="#mision">Misión y visión</a><a href="#resultados">Resultados académicos</a></div></div>
        <a href="#noticias" onClick={() => setMenuOpen(false)}>Noticias</a><a href="#galeria" onClick={() => setMenuOpen(false)}>Galería</a><a href="#comunidad" onClick={() => setMenuOpen(false)}>Comunidad</a><a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a><a className="mobile-admission" href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Admisión 2027</a>
      </nav><a className="admission-btn" href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer">Admisión 2027 <span>↗</span></a>
    </div></header>

    {/* Banner principal y carrusel de contenidos destacados. */}
    <section className="hero" id="inicio" aria-label="Información destacada">
      {slides.map((slide,index)=><article className={`slide ${slide.admission?'admission-slide':''} ${index===current?'active':''}`} key={slide.title} aria-hidden={index!==current}><img src={slide.image} alt={slide.admission?'Banner de Admisión 2027':'Estudiantes participando en una jornada escolar'}/><div className="hero-overlay"/><div className="shell hero-content"><div className="eyebrow"><span/>{slide.eyebrow}</div>{!slide.admission&&<><h1>{slide.title}</h1><p>{slide.text}</p></>}<a className="hero-btn" href={slide.href} target={slide.external?'_blank':undefined} rel={slide.external?'noreferrer':undefined}>{slide.action} <span>↗</span></a></div></article>)}
      <div className="shell hero-controls"><button onClick={()=>move(-1)} aria-label="Imagen anterior">←</button><div className="dots">{slides.map((slide,index)=><button key={slide.title} className={index===current?'active':''} onClick={()=>setCurrent(index)} aria-label={`Ver imagen ${index+1}`}/>)}</div><button onClick={()=>move(1)} aria-label="Imagen siguiente">→</button></div><div className="scroll-note"><span/> DESCUBRE MÁS</div>
    </section>

    {/* Accesos rápidos: calendario, resultados y admisión. */}
    <section className="quick-links" aria-label="Accesos rápidos"><div className="shell quick-grid">
      <a href="#noticias"><b>01</b><span><small>REVISA NUESTRO</small>Calendario escolar</span><i>→</i></a><a href="#resultados"><b>02</b><span><small>CONOCE NUESTROS</small>Resultados SIMCE</span><i>→</i></a><a href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer"><b>03</b><span><small>INFORMACIÓN DE</small>Admisión y matrícula</span><i>↗</i></a>
    </div></section>

    <section className="about section" id="nuestra-escuela"><div className="shell about-grid"><div className="about-copy" id="mision"><p className="section-kicker">NUESTRA ESCUELA</p><h2>Educamos con propósito,<br/><em>preparados para la vida.</em></h2><p className="lead">La Escuela Julio Montt Salamanca acompaña a sus estudiantes en una formación integral, inclusiva y comprometida con su desarrollo.</p><div className="mission-grid"><div><span>01</span><h3>Misión</h3><p>Nuestra Escuela entrega una educación integral, a través de experiencias y metodologías que desarrollan en nuestros niños y niñas sus habilidades cognitivas, sociales, artísticas, deportivas y emocionales; en un clima de aceptación, donde se respeta la diversidad y se promueve la inclusión.</p></div><div><span>02</span><h3>Visión</h3><p>Queremos que todos los estudiantes al egresar de nuestra escuela alcancen valores como respeto, esfuerzo y resiliencia, con el propósito de lograr ser personas críticas que les permitan desarrollarse íntegramente para insertarse en la sociedad de manera responsable con ellos mismos y con su entorno. Pretendemos entregar una formación laica, afectiva y democrática, donde cada uno de nuestros estudiantes potencie su autonomía y sus competencias cognitivas, artísticas y deportivas, respetando las diferencias individuales en una cultura inclusiva.</p></div></div></div><div className="about-visual"><div className="yellow-shape"/><img src="https://berkeleyjournal.org/files/2022/06/21-1024x637.jpeg" alt="Estudiantes aprendiendo en su sala de clases"/><div className="years"><strong>64</strong><span>AÑOS DE<br/>TRAYECTORIA</span></div></div></div></section>

    <section className="results section" id="resultados"><div className="shell"><div className="results-heading"><div><p className="section-kicker light">RESULTADOS ACADÉMICOS</p><h2>El esfuerzo de todos<br/><em>se transforma en logros.</em></h2></div><p>Avanzamos con metas claras y acompañamiento permanente para que cada estudiante alcance su máximo potencial.</p></div><div className="stats"><div><strong>286</strong><span>pts.</span><p>SIMCE Lectura<br/><small>4° básico · último proceso</small></p></div><div><strong>279</strong><span>pts.</span><p>SIMCE Matemática<br/><small>4° básico · último proceso</small></p></div><div><strong>94</strong><span>%</span><p>Asistencia promedio<br/><small>Comunidad comprometida</small></p></div><div><strong>82</strong><span>%</span><p>Continuidad de estudios<br/><small>Educación superior</small></p></div></div><p className="data-note">* Cifras demostrativas. Reemplázalas por los resultados oficiales del establecimiento.</p></div></section>

    <section className="news section" id="noticias"><div className="shell"><div className="section-title-row"><div><p className="section-kicker">ACTUALIDAD</p><h2>Noticias y <em>próximas fechas</em></h2></div><a className="text-link" href="#noticias">VER TODAS <span>→</span></a></div><div className="news-list">{news.map(item=><article key={item.title}><time><strong>{item.day}</strong><span>{item.month}</span></time><div><small>{item.tag}</small><h3>{item.title}</h3></div><button aria-label={`Leer ${item.title}`}>↗</button></article>)}</div></div></section>

    <section className="gallery-section section" id="galeria"><div className="shell"><div className="gallery-heading"><div><p className="section-kicker">NUESTRA GALERÍA</p><h2>Momentos que construyen<br/><em>nuestra historia.</em></h2></div><p>Una selección de nuestras actividades. Abre la galería completa para conocer todos los registros.</p></div><div className="gallery-grid">{galleryAlbums.map((album,index)=><figure key={album.subtitle} className={`gallery-item gallery-item-${index+1}`}><a className="gallery-open" href={`${publicPath}/galeria/`} target="_blank" rel="noreferrer" aria-label={`Abrir galería completa desde ${album.subtitle}`}><img src={album.cover} alt={`Portada de ${album.subtitle}`}/><figcaption><small>{album.title}</small><strong>{album.subtitle}</strong><span>VER GALERÍA ↗</span></figcaption></a></figure>)}</div></div></section>

    {/* Comunidad: acceso a Instagram y fotografías de muestra de la galería escolar. */}
    <section className="social section" id="comunidad"><div className="shell social-inner"><div className="social-copy"><p className="section-kicker light">SIGAMOS CONECTADOS</p><h2>La vida de la escuela,<br/><em>también en tus redes.</em></h2><p>Entérate de actividades, logros y momentos que hacen especial nuestra comunidad.</p><div className="social-buttons"><a href="https://www.instagram.com/escuelajmsmacul/" target="_blank" rel="noreferrer" aria-label="Instagram de la Escuela Julio Montt Salamanca">◎</a></div></div><div className="community-gallery" aria-label="Galería de la comunidad escolar">{communityGallery.map((item,index)=><figure key={item.image} className={index===0?'featured':''}><img src={item.image} alt={item.alt}/></figure>)}</div></div></section>

    <section className="location section" id="contacto"><div className="shell location-grid"><div><p className="section-kicker">ENCUÉNTRANOS</p><h2>Ven a <em>conocernos.</em></h2><p>Te esperamos en Macul para que conozcas nuestra escuela y el proyecto educativo que hemos construido durante 64 años.</p><dl><div><dt>DIRECCIÓN</dt><dd>Pedro Prado 4375<br/>Macul, Santiago</dd></div></dl><a className="hero-btn dark" href="https://www.google.com/maps/search/?api=1&query=Pedro+Prado+4375%2C+Macul%2C+Santiago" target="_blank" rel="noreferrer">CÓMO LLEGAR <span>↗</span></a></div><div className="map-card"><iframe title="Ubicación de la Escuela Julio Montt Salamanca" src="https://www.openstreetmap.org/export/embed.html?bbox=-70.62%2C-33.51%2C-70.55%2C-33.46&amp;layer=mapnik" loading="lazy"/><div className="map-label"><img src={`${publicPath}/logo-jms.png`} alt=""/><span><strong>Escuela Julio Montt Salamanca</strong>Pedro Prado 4375, Macul</span></div></div></div></section>

    <footer><div className="shell footer-main"><div className="brand footer-brand"><img src={`${publicPath}/logo-jms.png`} alt="Escudo de la Escuela Julio Montt Salamanca"/><span><strong>Escuela Julio Montt<br/>Salamanca</strong><small>Preparado para la vida</small></span></div><div><h3>ESCUELA</h3><a href="#mision">Misión y visión</a><a href="#resultados">Resultados académicos</a><a href="#noticias">Noticias</a></div><div><h3>INFORMACIÓN</h3><a href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer">Admisión 2027</a><a href="#galeria">Galería</a><a href="#contacto">Ubicación</a></div><div className="footer-cta"><h3>VISÍTANOS</h3><p>Pedro Prado 4375<br/>Macul, Santiago</p><a href="#contacto">VER UBICACIÓN →</a></div></div><div className="shell copyright"><span>© 2026 Escuela Julio Montt Salamanca. Todos los derechos reservados.</span><span>Macul · Santiago</span></div></footer>

  </main>;
}
