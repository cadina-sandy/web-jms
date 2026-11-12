import HeroCarousel from './HeroCarousel';
import SiteHeader from './SiteHeader';

const publicPath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Noticias y fechas mostradas en la página de inicio.
const news = [
  { day: '18', month: 'MAR', monthId: 'marzo', tag: 'COMUNIDAD', title: 'Inicio de talleres extracurriculares 2026' },
  { day: '24', month: 'MAR', monthId: 'marzo', tag: 'ACADÉMICO', title: 'Primera reunión de apoderados del año' },
  { day: '05', month: 'ABR', monthId: 'abril', tag: 'DEPORTE', title: 'Encuentro deportivo interescolar' },
];

// Mini galería ubicada junto a la sección "Sigamos conectados".
// Estas fotografías son muestras distintas de las portadas usadas en "Nuestra galería".
const communityGallery = [
  { image: `${publicPath}/gallery/fiesta-de-la-chilenidad/equipo/DSC_1042.JPG`, alt: 'Presentación de baile durante la Fiesta de la Chilenidad' },
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
  // Estructura de la página, en orden:
  // 1. Barra superior y encabezado.
  // 2. Banner principal y accesos rápidos.
  // 3. Nuestra escuela, misión, visión y trayectoria.
  // 4. Resultados académicos y noticias.
  // 5. Galería, comunidad y acceso a Admisión 2027.
  // 6. Ubicación, pie de página y visor ampliado de fotografías.
  return <main>
    <SiteHeader />

    <HeroCarousel />

    {/* Accesos rápidos: calendario, resultados y admisión. */}
    <section className="quick-links" aria-label="Accesos rápidos"><div className="shell quick-grid">
      <a href={`${publicPath}/calendario/`} target="_blank" rel="noreferrer"><b>01</b><span><small>REVISA NUESTRO</small>Calendario escolar</span><i>↗</i></a><a href="#resultados"><b>02</b><span><small>CONOCE NUESTROS</small>Resultados SIMCE</span><i>→</i></a><a href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer"><b>03</b><span><small>INFORMACIÓN DE</small>Admisión y matrícula</span><i>↗</i></a>
    </div></section>

    <section className="about section" id="nuestra-escuela"><div className="shell about-grid"><div className="about-copy" id="mision"><p className="section-kicker">NUESTRA ESCUELA</p><h2>Educamos con propósito,<br/><em>preparados para la vida.</em></h2><p className="lead">La Escuela Julio Montt Salamanca acompaña a sus estudiantes en una formación integral, inclusiva y comprometida con su desarrollo.</p><div className="mission-grid"><div><span>01</span><h3>Misión</h3><p>Nuestra Escuela entrega una educación integral, a través de experiencias y metodologías que desarrollan en nuestros niños y niñas sus habilidades cognitivas, sociales, artísticas, deportivas y emocionales; en un clima de aceptación, donde se respeta la diversidad y se promueve la inclusión.</p></div><div><span>02</span><h3>Visión</h3><p>Queremos que todos los estudiantes al egresar de nuestra escuela alcancen valores como respeto, esfuerzo y resiliencia, con el propósito de lograr ser personas críticas que les permitan desarrollarse íntegramente para insertarse en la sociedad de manera responsable con ellos mismos y con su entorno. Pretendemos entregar una formación laica, afectiva y democrática, donde cada uno de nuestros estudiantes potencie su autonomía y sus competencias cognitivas, artísticas y deportivas, respetando las diferencias individuales en una cultura inclusiva.</p></div></div></div><div className="about-visual"><div className="yellow-shape"/><img src="https://berkeleyjournal.org/files/2022/06/21-1024x637.jpeg" alt="Estudiantes aprendiendo en su sala de clases"/><div className="years"><strong>64</strong><span>AÑOS DE<br/>TRAYECTORIA</span></div></div></div></section>

    {/* Resultados verificados para la Escuela Julio Montt Salamanca, RBD 9122. */}
    <section className="results section" id="resultados"><div className="shell"><div className="results-heading"><div><p className="section-kicker light">RESULTADOS ACADÉMICOS</p><h2>El esfuerzo de todos<br/><em>se transforma en logros.</em></h2></div><p>Avanzamos con metas claras y acompañamiento permanente para que cada estudiante alcance su máximo potencial.</p></div><div className="stats"><div><strong>272</strong><span>pts.</span><p>SIMCE Lectura<br/><small>Enseñanza básica · 2025</small></p></div><div><strong>252</strong><span>pts.</span><p>SIMCE Matemática<br/><small>Enseñanza básica · 2025</small></p></div><div><strong>422</strong><span></span><p>Matrícula total<br/><small>Estudiantes</small></p></div><div><strong>23</strong><span></span><p>Promedio por curso<br/><small>Estudiantes</small></p></div></div><p className="data-note">* SIMCE 2025 redondeado al punto más cercano. Datos públicos de MINEDUC para el establecimiento RBD 9122.</p></div></section>

    {/* Noticias: cada fecha y “Ver todas” abren el calendario completo. */}
    <section className="news section" id="noticias"><div className="shell"><div className="section-title-row"><div><p className="section-kicker">ACTUALIDAD</p><h2>Noticias y <em>próximas fechas</em></h2></div><a className="text-link" href={`${publicPath}/calendario/`} target="_blank" rel="noreferrer">VER TODAS <span>↗</span></a></div><div className="news-list">{news.map(item=><a href={`${publicPath}/calendario/#${item.monthId}`} target="_blank" rel="noreferrer" key={item.title} aria-label={`Ver ${item.title} en el calendario`}><article><time><strong>{item.day}</strong><span>{item.month}</span></time><div><small>{item.tag}</small><h3>{item.title}</h3></div><span className="news-arrow">↗</span></article></a>)}</div></div></section>

    <section className="gallery-section section" id="galeria"><div className="shell"><div className="gallery-heading"><div><p className="section-kicker">NUESTRA GALERÍA</p><h2>Momentos que construyen<br/><em>nuestra historia.</em></h2></div><p>Una selección de nuestras actividades. Abre la galería completa para conocer todos los registros.</p></div><div className="gallery-grid">{galleryAlbums.map((album,index)=><figure key={album.subtitle} className={`gallery-item gallery-item-${index+1}`}><a className="gallery-open" href={`${publicPath}/galeria/`} target="_blank" rel="noreferrer" aria-label={`Abrir galería completa desde ${album.subtitle}`}><img src={album.cover} alt={`Portada de ${album.subtitle}`}/><figcaption><small>{album.title}</small><strong>{album.subtitle}</strong><span>VER GALERÍA ↗</span></figcaption></a></figure>)}</div></div></section>

    {/* Comunidad: acceso a Instagram y fotografías de muestra de la galería escolar. */}
    <section className="social section" id="comunidad"><div className="shell social-inner"><div className="social-copy"><p className="section-kicker light">SIGAMOS CONECTADOS</p><h2>La vida de la escuela,<br/><em>también en tus redes.</em></h2><p>Entérate de actividades, logros y momentos que hacen especial nuestra comunidad en INSTAGRAM.</p><div className="social-buttons"><a href="https://www.instagram.com/escuelajmsmacul/" target="_blank" rel="noreferrer" aria-label="Instagram de la Escuela Julio Montt Salamanca"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" className="instagram-dot"/></svg><span>Instagram</span></a></div></div><div className="community-gallery" aria-label="Galería de la comunidad escolar">{communityGallery.map((item,index)=><figure key={item.image} className={index===0?'featured':''}><img src={item.image} alt={item.alt}/></figure>)}</div></div></section>

    <section className="location section" id="contacto"><div className="shell location-grid"><div><p className="section-kicker">ENCUÉNTRANOS</p><h2>Ven a <em>conocernos.</em></h2><p>Te esperamos en Macul para que conozcas nuestra escuela y el proyecto educativo que hemos construido durante 64 años.</p><dl><div><dt>DIRECCIÓN</dt><dd>Pedro Prado 4375<br/>Macul, Santiago</dd></div></dl><a className="hero-btn dark" href="https://www.google.com/maps/search/?api=1&query=Pedro+Prado+4375%2C+Macul%2C+Santiago" target="_blank" rel="noreferrer">CÓMO LLEGAR <span>↗</span></a></div><div className="map-card"><iframe title="Ubicación de la Escuela Julio Montt Salamanca" src="https://www.openstreetmap.org/export/embed.html?bbox=-70.62%2C-33.51%2C-70.55%2C-33.46&amp;layer=mapnik" loading="lazy"/><div className="map-label"><img src={`${publicPath}/logo-jms.png`} alt=""/><span><strong>Escuela Julio Montt Salamanca</strong>Pedro Prado 4375, Macul</span></div></div></div></section>

    <footer><div className="shell footer-main"><a className="brand footer-brand" href="https://cadina-sandy.github.io/web-jms/"><img src={`${publicPath}/logo-jms.png`} alt="Escudo de la Escuela Julio Montt Salamanca"/><span><strong>Escuela Julio Montt<br/>Salamanca</strong><small>Preparado para la vida</small></span></a><div><h3>ESCUELA</h3><a href="#mision">Misión y visión</a><a href="#resultados">Resultados académicos</a><a href="#noticias">Noticias</a></div><div><h3>INFORMACIÓN</h3><a href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer">Admisión 2027</a><a href="#galeria">Galería</a><a href="#contacto">Ubicación</a></div><div className="footer-cta"><h3>VISÍTANOS</h3><p>Pedro Prado 4375<br/>Macul, Santiago</p><a href="#contacto">VER UBICACIÓN →</a></div></div><div className="shell copyright"><span>© 2026 Escuela Julio Montt Salamanca. Todos los derechos reservados.</span><span>Macul · Santiago</span></div></footer>

  </main>;
}
