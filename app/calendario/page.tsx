import './calendar.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

type Activity = { day: string; category: string; title: string; detail: string };
type Month = { id: string; name: string; short: string; activities: Activity[] };

// Calendario anual: cada bloque conserva la fecha a la izquierda y la información a la derecha.
const months: Month[] = [
  { id: 'marzo', name: 'Marzo', short: 'MAR', activities: [
    { day: '03', category: 'ACADÉMICO', title: 'Inicio del año escolar', detail: 'Bienvenida a estudiantes y organización de la primera jornada.' },
    { day: '18', category: 'COMUNIDAD', title: 'Inicio de talleres extracurriculares', detail: 'Comienzo de actividades artísticas, deportivas y formativas.' },
    { day: '20', category: 'INCLUSIÓN', title: 'Día del Síndrome de Down', detail: 'Jornada de sensibilización y participación de la comunidad.' },
    { day: '24', category: 'APODERADOS', title: 'Primera reunión de apoderados', detail: 'Encuentro informativo por cursos para comenzar el año.' },
  ]},
  { id: 'abril', name: 'Abril', short: 'ABR', activities: [
    { day: '05', category: 'DEPORTE', title: 'Encuentro deportivo interescolar', detail: 'Jornada recreativa y deportiva junto a otras comunidades.' },
    { day: '07', category: 'INCLUSIÓN', title: 'Semana de concientización sobre el autismo', detail: 'Actividades de aprendizaje, respeto e inclusión.' },
    { day: '22', category: 'LECTURA', title: 'Celebración del Día del Libro', detail: 'Lecturas, presentaciones y experiencias literarias.' },
    { day: '29', category: 'ACADÉMICO', title: 'Muestra de aprendizajes', detail: 'Exposición de trabajos realizados durante el primer período.' },
  ]},
  { id: 'mayo', name: 'Mayo', short: 'MAY', activities: [
    { day: '06', category: 'VIDA SALUDABLE', title: 'Jornada de vida saludable', detail: 'Hábitos, alimentación y movimiento para toda la comunidad.' },
    { day: '12', category: 'ACADÉMICO', title: 'Reunión de evaluación formativa', detail: 'Seguimiento de avances y acompañamiento pedagógico.' },
    { day: '20', category: 'CONVIVENCIA', title: 'Día de la buena convivencia', detail: 'Actividades para fortalecer el respeto y el buen trato.' },
    { day: '28', category: 'COMUNIDAD', title: 'Encuentro de familias', detail: 'Espacio de participación y colaboración escolar.' },
  ]},
  { id: 'junio', name: 'Junio', short: 'JUN', activities: [
    { day: '05', category: 'MEDIOAMBIENTE', title: 'Día del Medioambiente', detail: 'Acciones de cuidado del entorno y educación ambiental.' },
    { day: '11', category: 'DEPORTE', title: 'Campeonato de voleibol', detail: 'Encuentro deportivo y ceremonia de premiación.' },
    { day: '15', category: 'DEPORTE', title: 'Campeonato de tenis de mesa', detail: 'Competencia escolar y encuentro entre participantes.' },
    { day: '26', category: 'ACADÉMICO', title: 'Cierre del primer semestre', detail: 'Finalización de actividades académicas del período.' },
  ]},
  { id: 'julio', name: 'Julio', short: 'JUL', activities: [
    { day: '06', category: 'COMUNIDAD', title: 'Inicio de vacaciones de invierno', detail: 'Pausa de invierno para estudiantes y familias.' },
    { day: '20', category: 'ACADÉMICO', title: 'Regreso a clases', detail: 'Inicio de las actividades del segundo semestre.' },
    { day: '23', category: 'LECTURA', title: 'Biblioteca abierta', detail: 'Jornada de lectura y préstamo de libros.' },
    { day: '30', category: 'CONVIVENCIA', title: 'Encuentro de curso', detail: 'Actividad para fortalecer vínculos y acuerdos de convivencia.' },
  ]},
  { id: 'agosto', name: 'Agosto', short: 'AGO', activities: [
    { day: '07', category: 'COMUNIDAD', title: 'Celebración del Día de la Niñez', detail: 'Jornada recreativa preparada para nuestros estudiantes.' },
    { day: '12', category: 'ACADÉMICO', title: 'Feria de ciencias', detail: 'Presentación de proyectos, experimentos y descubrimientos.' },
    { day: '19', category: 'ARTE', title: 'Festival de música', detail: 'Presentaciones musicales de estudiantes y talleres.' },
    { day: '27', category: 'APODERADOS', title: 'Reunión de apoderados', detail: 'Información académica y actividades del segundo semestre.' },
  ]},
  { id: 'septiembre', name: 'Septiembre', short: 'SEP', activities: [
    { day: '04', category: 'PATRIMONIO', title: 'Preparación de muestras culturales', detail: 'Ensayos y elaboración de trabajos sobre tradiciones chilenas.' },
    { day: '10', category: 'COMUNIDAD', title: 'Fiesta de la Chilenidad', detail: 'Música, bailes, muestras y encuentro de la comunidad escolar.' },
    { day: '14', category: 'ACADÉMICO', title: 'Semana de la cultura chilena', detail: 'Experiencias de aprendizaje vinculadas a nuestro patrimonio.' },
    { day: '25', category: 'CONVIVENCIA', title: 'Regreso y encuentro comunitario', detail: 'Reencuentro de cursos y continuidad del semestre.' },
  ]},
  { id: 'octubre', name: 'Octubre', short: 'OCT', activities: [
    { day: '02', category: 'COMUNIDAD', title: 'Aniversario de la escuela', detail: 'Actividades de celebración por nuestros 64 años de trayectoria.' },
    { day: '08', category: 'DEPORTE', title: 'Campeonato de ajedrez', detail: 'Jornada de estrategia, participación y premiación.' },
    { day: '16', category: 'ACADÉMICO', title: 'Feria de proyectos', detail: 'Exposición de aprendizajes y trabajos de los cursos.' },
    { day: '28', category: 'CONVIVENCIA', title: 'Semana del buen trato', detail: 'Acciones para promover relaciones respetuosas y cuidadosas.' },
  ]},
  { id: 'noviembre', name: 'Noviembre', short: 'NOV', activities: [
    { day: '05', category: 'ARTE', title: 'Muestra artística anual', detail: 'Exposición de trabajos y presentaciones de los talleres.' },
    { day: '12', category: 'DEPORTE', title: 'Jornada deportiva familiar', detail: 'Encuentro recreativo para estudiantes y familias.' },
    { day: '19', category: 'ACADÉMICO', title: 'Cierre de proyectos de aula', detail: 'Presentación de experiencias desarrolladas durante el año.' },
    { day: '26', category: 'APODERADOS', title: 'Reunión informativa de cierre', detail: 'Orientaciones para finalizar el año escolar.' },
  ]},
  { id: 'diciembre', name: 'Diciembre', short: 'DIC', activities: [
    { day: '03', category: 'INCLUSIÓN', title: 'Día de la inclusión', detail: 'Encuentro para valorar la diversidad de nuestra comunidad.' },
    { day: '10', category: 'ACADÉMICO', title: 'Cierre del año escolar', detail: 'Última jornada de actividades académicas.' },
    { day: '15', category: 'COMUNIDAD', title: 'Ceremonia de reconocimiento', detail: 'Reconocimiento al esfuerzo, participación y compañerismo.' },
    { day: '18', category: 'COMUNIDAD', title: 'Despedida de estudiantes', detail: 'Encuentro de cierre y buenos deseos para el nuevo período.' },
  ]},
];

export default function CalendarioPage() {
  return <main className="calendar-page">
    {/* Encabezado de la página independiente de fechas y actividades. */}
    <header className="calendar-header"><div className="calendar-shell"><a className="calendar-brand" href={`${basePath}/`}><img src={`${basePath}/logo-jms.png`} alt="Escudo de la Escuela Julio Montt Salamanca"/><span><strong>Escuela Julio Montt Salamanca</strong><small>Preparado para la vida</small></span></a><a className="calendar-back" href={`${basePath}/`}>← Volver al inicio</a></div></header>

    <section className="calendar-hero"><div className="calendar-shell"><p>CALENDARIO ESCOLAR 2026</p><h1>Noticias, fechas y<br/><em>actividades.</em></h1><span>Consulta la programación organizada por mes. Las fechas pueden estar sujetas a ajustes del establecimiento.</span></div></section>

    {/* Filtro horizontal: cada mes lleva directamente a su sección en esta página. */}
    <nav className="month-filter" aria-label="Filtrar actividades por mes"><div className="calendar-shell">{months.map(month=><a href={`#${month.id}`} key={month.id}>{month.short}</a>)}</div></nav>

    {/* Secciones mensuales: cuatro actividades por mes. */}
    <div className="calendar-shell calendar-months">{months.map(month=><section className="month-section" id={month.id} key={month.id}><div className="month-heading"><p>{month.short} · 2026</p><h2>{month.name}</h2><span>{month.activities.length} actividades</span></div><div className="activity-list">{month.activities.map(activity=><article key={`${month.id}-${activity.day}-${activity.title}`}><time><strong>{activity.day}</strong><span>{month.short}</span></time><div><small>{activity.category}</small><h3>{activity.title}</h3><p>{activity.detail}</p></div></article>)}</div></section>)}</div>

    <footer className="calendar-footer"><div className="calendar-shell"><span>© 2026 Escuela Julio Montt Salamanca</span><span>Pedro Prado 4375 · Macul, Santiago</span></div></footer>
  </main>;
}
