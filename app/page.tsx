'use client';
import { useRef, useState } from 'react';
import SchoolHome from './SchoolHome';
import './gallery.css';
// Desactivar para recuperar la portada original.
const GALLERY_ENABLED = true;
// Fiesta de la Chilenidad conserva una sola categoría en los filtros.
// Organización de origen: A (1° a 8° y Pre-kínder), B (1° a 8° y Kínder),
// Equipo y Stand. Todas sus fotos usan la categoría «Fiesta de la Chilenidad».
const categories = ['Todas', 'Vista a Bomberos', 'Día del Autismo', 'Día del Libro', 'Día Saludable', 'Día del Síndrome de Down', 'Fiesta de la Chilenidad', 'Campeonato de Ajedrez 2026', 'Festival de Música', 'Campeonato Tenis de Mesa 2026', 'Campeonato de Voleibol 2026'];
const photos: { src: string; category: string; alt: string }[] = [
  {
    "src": "/gallery/ajedrez-2026/ajedrez-01.png",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Afiche del Campeonato de Ajedrez 2026 con piezas y una medalla"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-02.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Una mano mueve una pieza negra en el tablero"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-03.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Tablero de ajedrez junto a un reloj digital rojo"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-04.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Participantes mueven piezas durante sus partidas"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-05.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Primer plano de piezas blancas en un tablero"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-06.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Estudiantes jugando ajedrez a ambos lados de una mesa larga"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-07.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Primer plano de piezas de madera en un tablero"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-08.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Estudiantes concentrados frente a sus tableros"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-09.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Primer plano de una medalla dorada con cinta azul"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-10.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Participantes enfrentados en partidas de ajedrez"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-11.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Participantes con medallas durante la premiación"
  },
  {
    "src": "/gallery/ajedrez-2026/ajedrez-12.jpg",
    "category": "Campeonato de Ajedrez 2026",
    "alt": "Fotografía grupal durante la premiación del campeonato"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_125057.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Participante con paleta frente a la mesa de tenis de mesa"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_125052.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Dos participantes frente a frente en una mesa del campeonato"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_125054.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Intercambio de pelota durante una partida de tenis de mesa"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_125110.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Vista de una partida con público en las graderías"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_125112.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Participantes en movimiento durante el encuentro"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_125122.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Pelota en juego sobre la mesa del campeonato"
  },
  {
    "src": "/gallery/tenis-de-mesa-2026/20260615_131155.jpg",
    "category": "Campeonato Tenis de Mesa 2026",
    "alt": "Vista general del gimnasio con varias partidas de tenis de mesa"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_104104.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Organización de la jornada junto a la mesa de medallas y el equipo de voleibol"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_133801.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Equipo de voleibol posando con sus medallas junto a un adulto"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_133802.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Integrantes del equipo mostrando sus medallas en la cancha"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_134342.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Equipos participantes reunidos para una fotografía con sus medallas"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_103748.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Equipo reunido en círculo junto a la cancha"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_104034.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Jugadoras de ambos equipos se saludan junto a la red"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_104234.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Equipo reunido durante la jornada de voleibol"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_104703.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Primer plano de medallas doradas con cintas azules"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_110645.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Jugadoras reunidas escuchando indicaciones junto a la cancha"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_133611.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Integrantes del equipo y acompañantes en la cancha"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_133628.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Fotografía del equipo con sus acompañantes"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_133702.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Jugadoras posando juntas en la cancha"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_133758.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Vista amplia del equipo mostrando sus medallas"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_134041.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Primer plano de una medalla plateada de los Juegos Deportivos Escolares"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_134330.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Participantes de varios equipos posando con sus medallas"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_134336.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Fotografía general de los equipos reunidos en la cancha"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_134344.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Vista amplia de los equipos al finalizar la jornada"
  },
  {
    "src": "/gallery/voleibol-2026/20260611_134352.jpg",
    "category": "Campeonato de Voleibol 2026",
    "alt": "Fotografía grupal de participantes y acompañantes con sus medallas"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_121716.jpg",
    "category": "Día del Libro",
    "alt": "Estudiantes saludando detrás de una mesa con libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_121727.jpg",
    "category": "Día del Libro",
    "alt": "Grupo de estudiantes junto a un puesto de libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_122247.jpg",
    "category": "Día del Libro",
    "alt": "Estudiantes y acompañantes en la feria del libro del colegio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_122331.jpg",
    "category": "Día del Libro",
    "alt": "Estudiantes posando detrás de mesas con libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_122333.jpg",
    "category": "Día del Libro",
    "alt": "Grupo junto a un puesto de libros en el patio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_122629.jpg",
    "category": "Día del Libro",
    "alt": "Estudiantes revisando libros expuestos sobre mesas"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_122731.jpg",
    "category": "Día del Libro",
    "alt": "Niños y adultos reunidos alrededor de un puesto de cuentos"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_122734.jpg",
    "category": "Día del Libro",
    "alt": "Participantes explorando los libros de la feria"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_123130.jpg",
    "category": "Día del Libro",
    "alt": "Vista general de la feria del libro en el patio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_123132.jpg",
    "category": "Día del Libro",
    "alt": "Comunidad escolar recorriendo los puestos de libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124050.jpg",
    "category": "Día del Libro",
    "alt": "Participantes posando con un marco decorado del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124052.jpg",
    "category": "Día del Libro",
    "alt": "Grupo de participantes con un marco de letras de colores"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124053.jpg",
    "category": "Día del Libro",
    "alt": "Participantes sonriendo con el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124110.jpg",
    "category": "Día del Libro",
    "alt": "Tres estudiantes con un marco decorado junto a una mesa de libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124327.jpg",
    "category": "Día del Libro",
    "alt": "Participante sosteniendo el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124144.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante levantando el marco junto a un puesto de libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124418.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante mostrando un libro dentro del marco decorativo"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124526.jpg",
    "category": "Día del Libro",
    "alt": "Grupo de estudiantes con el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_124539.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante sosteniendo el marco en el patio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_125418.jpg",
    "category": "Día del Libro",
    "alt": "Participante sonriendo con el marco en un pasillo"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_125514.jpg",
    "category": "Día del Libro",
    "alt": "Dos participantes posando con el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_125550.jpg",
    "category": "Día del Libro",
    "alt": "Dos participantes sentadas con un libro y el marco decorativo"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_125608.jpg",
    "category": "Día del Libro",
    "alt": "Dos estudiantes mostrando libros con el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130030.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante posando con el marco en el patio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130136.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante sosteniendo el marco frente a los puestos de libros"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130437.jpg",
    "category": "Día del Libro",
    "alt": "Participante posando con el marco en el patio del colegio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130532.jpg",
    "category": "Día del Libro",
    "alt": "Dos estudiantes posando juntos con el marco decorativo"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130542.jpg",
    "category": "Día del Libro",
    "alt": "Tres estudiantes con el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130549.jpg",
    "category": "Día del Libro",
    "alt": "Cuatro estudiantes reunidos con el marco de letras de colores"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130641.jpg",
    "category": "Día del Libro",
    "alt": "Dos estudiantes sonriendo dentro del marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_130847.jpg",
    "category": "Día del Libro",
    "alt": "Dos estudiantes posando junto a los libros con el marco"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_133005.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante con el marco decorativo durante la feria"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_134203.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante sosteniendo el marco y un cuaderno en el patio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_135344.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante posando con el marco del Día del Libro"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_135448.jpg",
    "category": "Día del Libro",
    "alt": "Dos estudiantes jugando y posando con el marco en el patio"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_135540.jpg",
    "category": "Día del Libro",
    "alt": "Tres estudiantes posando con el marco decorativo"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_140256.jpg",
    "category": "Día del Libro",
    "alt": "Dos estudiantes con el marco del Día del Libro en una sala"
  },
  {
    "src": "/gallery/dia-del-libro/20260422_140513.jpg",
    "category": "Día del Libro",
    "alt": "Estudiante sosteniendo el marco del Día del Libro junto a una pared"
  },
  {
    "src": "/gallery/bomberos/2.jpeg",
    "category": "Vista a Bomberos",
    "alt": "Estudiantes junto a un carro de Bomberos en el cuartel"
  },
  {
    "src": "/gallery/bomberos/3.jpeg",
    "category": "Vista a Bomberos",
    "alt": "Estudiantes observan la cabina de un carro de Bomberos"
  },
  {
    "src": "/gallery/bomberos/4.jpeg",
    "category": "Vista a Bomberos",
    "alt": "Un bombero conversa con estudiantes dentro del carro"
  },
  {
    "src": "/gallery/bomberos/bomba1.jpeg",
    "category": "Vista a Bomberos",
    "alt": "Estudiantes conocen el equipamiento de Bomberos en el cuartel"
  },
  {
    "src": "/gallery/bomberos/bombero-1.png",
    "category": "Vista a Bomberos",
    "alt": "Afiche de la visita de quinto básico a la Compañía N°7 de Bomberos de Macul"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_092723.jpg",
    "category": "Día del Autismo",
    "alt": "Un estudiante deja su huella de pintura en un mural con acompañamiento de una adulta"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_111928.jpg",
    "category": "Día del Autismo",
    "alt": "Puesto de actividades sobre mitos y verdades del autismo"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_111943.jpg",
    "category": "Día del Autismo",
    "alt": "Vista del puesto del Día del Autismo y su mesa de materiales"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_111958.jpg",
    "category": "Día del Autismo",
    "alt": "Una adulta presenta la actividad de mitos y verdades"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_112559.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes colocan adhesivos en el panel participativo"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_112602.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes junto al panel de mitos y verdades"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_112611.jpg",
    "category": "Día del Autismo",
    "alt": "Participantes conversan alrededor del panel de la actividad"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_112615.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes y adultos reunidos junto al puesto"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_113457.jpg",
    "category": "Día del Autismo",
    "alt": "Entrega de materiales a estudiantes durante la actividad"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_113705.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes participan en juegos de mesa en el patio"
  },
  {
    "src": "/gallery/dia-del-autismo/20260408_112910.jpg",
    "category": "Día del Autismo",
    "alt": "Actividad participativa sobre amistad e inclusión"
  },
  {
    "src": "/gallery/dia-del-autismo/20260407_113751.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes juegan con bloques de madera en una mesa del patio"
  },
  {
    "src": "/gallery/dia-del-autismo/20260408_112943.jpg",
    "category": "Día del Autismo",
    "alt": "Un estudiante participa en el panel sobre amistad"
  },
  {
    "src": "/gallery/dia-del-autismo/20260408_112949.jpg",
    "category": "Día del Autismo",
    "alt": "Un estudiante coloca un adhesivo en el panel participativo"
  },
  {
    "src": "/gallery/dia-del-autismo/20260409_112423.jpg",
    "category": "Día del Autismo",
    "alt": "Panel de mitos y verdades con las respuestas de participantes"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_091155.jpg",
    "category": "Día del Autismo",
    "alt": "Una estudiante muestra su mano pintada de color naranja"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_091214.jpg",
    "category": "Día del Autismo",
    "alt": "Una estudiante junto al mural de huellas con forma de infinito"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_091236.jpg",
    "category": "Día del Autismo",
    "alt": "Un estudiante participa en el mural con acompañamiento de una adulta"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_092638.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes esperan su turno junto a los materiales de pintura"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_093302.jpg",
    "category": "Día del Autismo",
    "alt": "Estudiantes estampan huellas de colores en el mural"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_093312.jpg",
    "category": "Día del Autismo",
    "alt": "Participantes completan el mural de huellas en el pasillo"
  },
  {
    "src": "/gallery/dia-del-autismo/20260410_093323.jpg",
    "category": "Día del Autismo",
    "alt": "Vista de la actividad de pintura con estudiantes y adultos en el patio"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_085403.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Afiche de la actividad Ponte tus calcetines por el Día del Síndrome de Down"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093525.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines de distintos colores con zapatillas blancas"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093540.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines diferentes con zapatillas negras sobre un banco"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093821.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines celeste y rosado con zapatillas blancas"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093557.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines blancos, uno con dibujos de cerezas"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_094903.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines blanco y turquesa con zapatillas negras y rosadas"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_095347.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines gris y rosado con zapatillas multicolores"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_095433.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Comunidad escolar reunida en la cancha techada"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_095501.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Estudiantes y adultos durante el encuentro en la cancha"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_100041.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Detalle de calcetines diferentes con zapatillas infantiles"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_112255.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Mural de kínder con huellas de colores por el Día del Síndrome de Down"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_112304.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Trabajos de kínder expuestos en el mural escolar"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_112350.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Panel de prekínder con huellas de colores"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_115003.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Panel de segundo básico con trabajos por el Día del Síndrome de Down"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_115026.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Cartelera del colegio con el afiche Ponte tus calcetines"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093853.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines verde y azul con zapatillas negras"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093914.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines morado y turquesa con diseños distintos"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_093948.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines negros con diseños diferentes"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_094001.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines de distintos tonos con zapatillas rosadas"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_094938.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines celeste y rosado sobre el césped"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_095604.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Calcetines de distintos tonos con zapatillas blancas"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_114814.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Vista panorámica de los murales de distintos cursos"
  },
  {
    "src": "/gallery/dia-del-sindrome-de-down/20260320_112151.jpg",
    "category": "Día del Síndrome de Down",
    "alt": "Exposición panorámica de trabajos y huellas de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0880.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Retrato con vestido floral frente a la decoración Viva Chile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0893.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Comunidad reunida en el patio decorado con guirnaldas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0898.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja bailando ante el público en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0912.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante con sombrero negro y chaqueta roja junto al podio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1042.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participantes con vestidos florales reunidas en la cancha"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0956.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Presentadora con micrófono junto al podio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1053.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas bailando frente a las graderías"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1079.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos participantes posan con vestimenta tradicional"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1083.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Tres participantes posan frente a la decoración de la fiesta"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0020.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Público y participantes sentados en las graderías"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0881.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Retrato vertical con vestido floral frente al mural Viva Chile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1095.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos participantes posan con vestido floral y cinta tricolor"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0092.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante saluda a la cámara junto al equipo de sonido"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0021.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja bailando frente a las graderías"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0904.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante con vestido blanco de flores y pañuelo"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0897.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante con vestido verde y chal en el pasillo"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0023.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos participantes sonríen junto a un grupo de niños"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0901.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante posa con vestido de flores rosadas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0870.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del escenario decorado para la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1094.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos participantes posan frente al fondo blanco del escenario"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0909.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante con sombrero y manta saluda a la cámara"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0902.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja baila con pañuelos blancos en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0955.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Presentadora habla al público con un micrófono"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0952.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos participantes posan juntas en el pasillo"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1052.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas bailando en la cancha del colegio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1054.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Baile grupal frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1088.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pinturas coloridas expuestas en el balcón del colegio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1089.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participante con sombrero decorado cerca de los puestos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_1090.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de adultos y niños posa junto al escenario"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/equipo/DSC_0026.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Integrantes del equipo del colegio posan juntas durante la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0867.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Puesto de pizzetas decorado con banderas chilenas y manteles tricolores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0871.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Visitantes recorren los puestos de comida del patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0872.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista de los puestos con globos rojos, blancos y azules"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0003.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Niños y adultos junto al stand de juegos y su ruleta"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0874.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Puestos de empanadas, cabritas y algodón de azúcar en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0865.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Puesto de cafetería con su cartel de productos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0873.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Comunidad reunida junto a los stands decorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0875.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Stand de juegos con ruleta, premios y globos tricolores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/stand/DSC_0868.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos participantes detrás de una mesa de bebidas con manteles festivos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0894.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero A esperan su presentación con vestimenta tradicional"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0900.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja de estudiantes de primero A junto al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0907.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero A bailan en parejas frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0905.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero A se preparan para bailar junto al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0896.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de primero A con vestidos floreados antes de la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0895.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero A reunidos antes de su baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0906.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del baile de primero A con las familias alrededor del patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0908.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de primero A durante su presentación de baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/1/DSC_0910.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Presentación de primero A con trajes tradicionales en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0927.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo A bailan en el patio frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0924.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de segundo A espera su presentación junto a una adulta con vestido floreado"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0928.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista de la presentación de segundo A bajo las guirnaldas tricolores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0925.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo A con pañuelos rojos y gorros de lana antes del baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0930.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de segundo A durante su baile con vestimenta roja, blanca y negra"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0929.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo A realizan pasos de baile frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0863.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo A posan juntos junto al patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0862.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos estudiantes de segundo A posan con pañuelos rojos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/2/DSC_0864.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de segundo A sonríe para una fotografía durante la celebración"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0890.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de tercero A posa con camisas y vestidos floreados y coronas de flores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0892.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A posan levantando los brazos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0891.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Retrato grupal de tercero A con coronas de flores naranjas y rosadas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0932.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A esperan junto al público antes de bailar"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0889.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Tercero A reunido para una fotografía en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0936.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del baile de tercero A frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0934.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A sonríen junto a las sillas del público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0943.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Tercero A realiza desplazamientos durante su baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0944.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A se arrodillan ante el público durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0942.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de tercero A baila con vestimenta floreada roja y azul"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0947.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista lateral de la presentación de tercero A"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0946.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A levantan los brazos durante la coreografía"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0949.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Tercero A baila con los brazos extendidos frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0950.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de tercero A realiza un giro durante su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0933.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A se preparan junto al público con coronas de flores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0935.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de tercero A posa con coronas rosadas y naranjas junto al patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/3/DSC_0948.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero A continúan su coreografía frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0958.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto A bailan con pañuelos blancos y vestimenta de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0963.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de cuarto A levanta sus pañuelos durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0975.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto A avanzan saludando con pañuelos ante el público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0967.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Cuarto A realiza giros con pañuelos y vestimenta amarilla"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0939.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto A esperan su presentación con sombreros decorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0961.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de cuarto A bailan con vestimenta roja y rosada"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0962.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto A levantan pañuelos blancos frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0964.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja de cuarto A baila con vestimenta naranja y amarilla"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0966.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto A bailan con pañuelos y faldas de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0969.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de cuarto A levanta su pañuelo durante la coreografía"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0970.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja de cuarto A realiza un giro durante su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0971.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de cuarto A reúne sus pañuelos en alto durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/4/DSC_0937.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto A se preparan para la presentación junto al patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0974.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto A esperan su presentación con vestimenta tradicional"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0983.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de quinto A aplauden y preparan sus pañuelos durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0982.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto A realizan giros con vestidos floreados y pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0984.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista general de la presentación de quinto A ante las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0972.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de quinto A posa con sombreros y vestimenta tradicional en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0977.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto A posan con un poncho y vestidos floreados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0978.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de quinto A se prepara para bailar junto a la entrada del patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0976.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto A esperan juntos con sus pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0985.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Quinto A baila frente al público durante la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0981.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto A bailan con vestidos floreados y pañuelos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0986.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de quinto A levantan sus pañuelos durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/5/DSC_0993.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto A sonríen con vestimenta tradicional y pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0996.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto A bailan con faldas rojas y gorros de lana frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0999.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista general del baile de sexto A en el patio del colegio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0995.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de sexto A baila junto a una pequeña casa de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0997.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto A realizan pasos de baile con camisas a cuadros y faldas rojas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_1001.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de sexto A levantan sus pañuelos durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0988.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto A esperan su presentación con pañuelos rojos y gorros de lana"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0989.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de sexto A reunido antes de su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0990.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto A con faldas rojas se preparan junto a la decoración del patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_0998.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto A avanzan juntos con sus pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/6/DSC_1000.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de sexto A bailan frente a las familias durante la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1009.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A esperan con vestidos floreados y flores en el cabello"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1008.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de séptimo A avanza hacia el patio con su vestimenta tradicional"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1016.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A bailan en fila con pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1014.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A ingresan con sombreros y ponchos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1012.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A se preparan para bailar con vestidos floreados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1019.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de séptimo A realiza su presentación frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1018.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de séptimo A bailan con pañuelos, ponchos y vestidos floreados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1015.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A saludan con pañuelos al ingresar al patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1017.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista general del baile de séptimo A bajo la decoración tricolor"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1002.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A reunidos antes de la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1021.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Séptimo A forma una fila con pañuelos durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1026.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A levantan sus pañuelos frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1006.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A aplauden mientras esperan su turno"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1007.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de séptimo A espera con vestidos floreados y pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/7/DSC_1013.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo A posan con vestidos, ponchos y sombreros"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1029.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo A sostienen banderas chilenas con sus trajes de presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1031.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo A posa con trajes brillantes y sombreros decorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1035.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo A posan con tambores y platillos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1039.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo A se prepara con sus instrumentos de percusión"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1060.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo A esperan con sombreros y trajes de lentejuelas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1059.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo A se reúne junto a las familias antes de bailar"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1061.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo A avanzan con sus trajes de presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1070.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Octavo A realiza su coreografía frente al público en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1067.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo A aplauden durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1069.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo A baila con sombreros y adornos rosados y plateados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1064.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo A participan junto a banderas chilenas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1066.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Octavo A realiza pasos de baile frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/8/DSC_1068.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo A continúa su presentación en la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0882.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de prekínder posa con sombreros y vestimenta de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0914.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de prekínder bailan en parejas con sombreros verdes"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0913.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Prekínder realiza giros con vestimenta amarilla durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0915.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de prekínder forman una ronda con sombreros rojos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0884.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de prekínder posa junto a las adultas que lo acompañan"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0918.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista general del baile de prekínder frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0917.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de prekínder se toman de las manos durante la coreografía"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0919.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Prekínder recorre el patio en una ronda con vestimenta de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0923.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de prekínder saluda al público durante su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0886.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Prekínder se reúne para una fotografía grupal con sombreros de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0911.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de prekínder se preparan junto a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0916.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de prekínder con vestimenta amarilla giran durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/a/pk/DSC_0921.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del grupo de prekínder bailando en ronda en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/1/DSC_0019.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de primero B se reúne con sombreros y vestidos floreados antes de la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/1/DSC_0017.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero B esperan en parejas con vestimenta tradicional"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/1/DSC_0018.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja de primero B posa con sombrero negro y vestido floreado"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/1/DSC_0030.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero B bailan en el patio frente a las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/1/DSC_0022.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de primero B espera junto a las personas que lo acompañan"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/1/DSC_0029.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de primero B se preparan para su presentación en la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0055.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo B bailan con vestimenta rosada"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0005.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de segundo B posa con maquillaje de payaso y chaqueta amarilla"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0053.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de segundo B posa antes de la actividad junto a sus compañeras"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0052.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de segundo B saluda a la cámara antes de salir al patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0061.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de segundo B realiza un número con un globo blanco"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0063.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de segundo B interpreta un número de fuerza ante el público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0068.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de segundo B realiza una escena con disfraces de payasos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0073.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo B realizan equilibrios durante su baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0069.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participantes de segundo B actúan con disfraces coloridos ante las familias"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0056.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo B bailan con cintas rosadas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0057.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de segundo B levanta los brazos durante el baile con cintas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0058.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Escena de magia de segundo B junto a un panel rojo decorado con cartas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0059.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo B representan una escena circense con maquillaje y disfraces"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0065.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de segundo B levanta una barra de utilería durante su actuación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0071.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de segundo B presenta un número de payasos frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/2/DSC_0074.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de segundo B realizan una figura acrobática grupal"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/3/DSC_0088.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero B saludan con sombreros azules y adornos de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/3/DSC_0086.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero B posan junto al público con sombreros y chaleco negro"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/3/DSC_0089.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero B saludan junto a una cortina de cintas brillantes"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/3/DSC_0087.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de tercero B espera con vestimenta azul y blanca"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/3/DSC_0091.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero B se reúnen tras las cintas azules y plateadas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/3/DSC_0090.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de tercero B sonríen antes de su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0075.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto B esperan con boinas negras y vestimenta azul y roja"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0083.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto B bailan desplegando sus faldas rojas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0084.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del baile de cuarto B frente al público del colegio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0080.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de cuarto B participa en su baile con pañuelos blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0085.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto B bailan con boinas negras y pantalones rojos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0079.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto B presentan su coreografía con faldas rojas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0081.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto B sonríen durante el baile en parejas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0077.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de cuarto B saluda antes de su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_0082.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de cuarto B extienden sus faldas durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_1099.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de cuarto B posa junto a una rueda decorada con copihues y la bandera chilena"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/4/DSC_1100.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de cuarto B saluda junto a los adornos de la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0095.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B posan juntos con sombreros negros y pañuelos rojos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0096.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B sonríen y saludan junto a las cintas de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0094.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de quinto B espera su presentación con vestimenta negra y roja"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0093.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de quinto B sonríe con una flor roja en el cabello"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0112.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B bailan con pañuelos rojos frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0100.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de quinto B se prepara junto a una mesa con mantel a cuadros"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0113.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B levantan sombreros y pañuelos durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0115.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de quinto B participan en la presentación de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0097.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de quinto B se reúne junto a las cintas brillantes"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0099.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B comienzan su presentación junto a la mesa decorada"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0098.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B saludan antes de salir al patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0116.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja de quinto B avanza durante su baile con pañuelos rojos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0876.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de quinto B posa en el patio con una falda morada y blanca"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0110.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de quinto B bailan frente a las familias del colegio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0111.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B realizan su coreografía con vestimenta negra"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0114.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Pareja de quinto B baila con sombrero negro y pañuelo rojo"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0118.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de quinto B agitan sus pañuelos durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/5/DSC_0122.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de quinto B finalizan una figura del baile ante el público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0105.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B esperan con máscaras y capas negras y doradas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0106.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B posan con traje verde, máscara y corona"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0138.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de sexto B baila con máscaras coloridas y capas rojas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0103.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B se preparan con capas rojas y blancas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0137.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del grupo de sexto B durante su presentación en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0127.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B bailan con trajes verdes, blancos y dorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0107.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de sexto B espera con vestimenta roja y blanca y máscaras de colores"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0119.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de sexto B posa con traje blanco y máscara con cuernos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0129.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B realizan su coreografía con disfraces y máscaras"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0877.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de sexto B posa junto a un banco con vestimenta roja y blanca"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0124.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de sexto B participa con máscara de ave y capa negra y dorada"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0108.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de sexto B posa con una gran máscara roja y dorada"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0120.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de sexto B saluda con traje blanco y máscara"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0125.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B bailan frente al público con trajes de personajes"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0128.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de sexto B presenta su baile con capas, coronas y máscaras"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/6/DSC_0879.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de sexto B posan frente al mural Viva Chile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0133.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de séptimo B posa con un tocado de plumas blancas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0132.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de séptimo B se prepara con tocados y camisas florales"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0131.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B posan juntas antes de su baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0143.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista del grupo de séptimo B al inicio de su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0141.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B esperan junto a una adulta en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0147.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de séptimo B baila con vestimenta de plumas y camisas florales"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0149.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B bailan en parejas frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0148.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B realizan pasos de baile en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0150.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Participantes de séptimo B durante su coreografía"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0130.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de séptimo B reunido antes de la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0151.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Vista de la coreografía de séptimo B frente a las graderías"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0134.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B posan en grupo con tocados blancos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0135.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B sonríen y posan con su vestuario de baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0136.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de estudiantes de séptimo B posa antes de bailar"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0145.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B realizan movimientos coordinados durante el baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/7/DSC_0146.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de séptimo B bailan con camisa floral y traje decorado"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0001.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B posa con trajes brillantes en el gimnasio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0008.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de octavo B posa con sombrero y traje azul y dorado"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0011.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de octavo B posa con su vestuario de baile en el gimnasio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0153.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B esperan con sus trajes junto al pasillo"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0152.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B saluda antes de su presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0155.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de octavo B posa junto a una adulta con vestido verde"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0159.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B posan con adornos azules y amarillos"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0161.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B sonríe y hace gestos a la cámara"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0164.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B posan juntos con sombreros negros y dorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0163.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B sonríen junto a las columnas azules"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0162.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B posan antes de salir a bailar"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0165.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B conversan y sonríen en el pasillo"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0173.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Detalle del bordado multicolor y las lentejuelas del vestuario de octavo B"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0176.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B esperan con sombreros decorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0177.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B baila en parejas frente al público"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0178.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B se organizan durante su coreografía"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0183.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B realiza una figura de baile en el patio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0184.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B levantan sus sombreros durante la presentación"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0179.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Parejas de octavo B durante su baile en la Fiesta de la Chilenidad"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0187.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B bailan en fila con los brazos levantados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_1104.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B posa de pie en el gimnasio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_1101.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Dos estudiantes de octavo B posan sosteniendo sus sombreros"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_1106.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B posan juntos con su vestuario azul y dorado"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_1109.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de octavo B posa con traje de lentejuelas y adornos rosados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_1114.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Grupo de octavo B posa sentado y de pie junto a la pared del gimnasio"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0157.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de octavo B espera con sombrero y trenzas adornadas"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0174.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B saludan a la cámara antes del baile"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_0175.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiantes de octavo B sonríen con sus sombreros decorados"
  },
  {
    "src": "/gallery/fiesta-de-la-chilenidad/b/8/DSC_1110.JPG",
    "category": "Fiesta de la Chilenidad",
    "alt": "Estudiante de octavo B posa con sombrero negro y traje con detalles rosados"
  }
];
function Gallery() {
  const [category, setCategory] = useState('Todas');
  const [selected, setSelected] = useState(0);
  const [folder, setFolder] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const isChilenidad = category === 'Fiesta de la Chilenidad';
  const folderLabel = (value: string, parent?: string) => value === 'a' ? 'Cursos A' : value === 'b' ? 'Cursos B' : value === 'pk' ? 'Prekínder' : value === 'k' ? 'Kínder' : value === 'equipo' ? 'Equipo' : value === 'stand' ? 'Stand' : /^\d+$/.test(value) ? `${value}°${parent?.toUpperCase() ?? ''}` : value.toUpperCase();
  const browsingFolders = isChilenidad && (folder.length === 0 || (folder.length === 1 && ['a', 'b'].includes(folder[0])));
  const folders = folder.length === 0 ? ['a', 'b', 'equipo', 'stand'] : [...(folder[0] === 'a' ? ['pk'] : ['k']), ...Array.from({ length: 8 }, (_, index) => String(index + 1))];
  const photoGroups = categories.filter(name => name !== 'Todas').map(name => photos.filter(item => item.category === name)).filter(group => group.length > 0);
  const mixedPhotos: typeof photos = [];
  for (let round = 0; mixedPhotos.length < Math.min(10, photos.length); round++) {
    for (const group of photoGroups) {
      if (group[round]) mixedPhotos.push(group[round]);
      if (mixedPhotos.length === 10) break;
    }
  }
  const visible = category === 'Todas' ? mixedPhotos : photos.filter(photo => {
    if (photo.category !== category) return false;
    return !isChilenidad || (!browsingFolders && photo.src.startsWith(`/gallery/fiesta-de-la-chilenidad/${folder.join('/')}/`));
  });
  const openFolder = (path: string[]) => { setFolder(path); setSelected(0); };
  const photo = visible[selected];
  const move = (direction: number) => setSelected(value => (value + direction + visible.length) % visible.length);
  const close = () => dialog.current?.close();
  return <main className="gallery-page" id="galeria">
    <header className="gallery-header"><a className="gallery-brand" href="#galeria"><img src="/logo-jms.png" alt="Escudo del Colegio JMS" /><span><strong>Colegio JMS</strong><small>Macul · Chile</small></span></a><span className="gallery-header-label">Nuestra comunidad en imágenes</span><a className="gallery-instagram" href="https://www.instagram.com/escuelajmsmacul/" target="_blank" rel="noreferrer">Instagram ↗</a></header>
    <section className="gallery-intro" aria-labelledby="gallery-title"><div><p className="gallery-kicker">GALERÍA · COLEGIO JMS</p><h1 id="gallery-title">Pequeños momentos.<br /><em>Grandes recuerdos.</em></h1></div><p>Un recorrido por el aprendizaje y la vida en comunidad.</p></section>
    <section className="gallery-collection" aria-label="Galería de imágenes">
      <div className="gallery-toolbar"><nav aria-label="Secciones de la galería">{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setSelected(0); setFolder([]); }}>{item}<span>{item === 'Todas' ? photos.length : photos.filter(photo => photo.category === item).length}</span></button>)}</nav></div>
      {isChilenidad && <nav className="gallery-breadcrumbs" aria-label="Ubicación en Fiesta de la Chilenidad"><button onClick={() => openFolder([])} aria-current={folder.length === 0 ? 'page' : undefined}>Fiesta de la Chilenidad</button>{folder.map((part, index) => <span key={part}><span aria-hidden="true">/</span><button onClick={() => openFolder(folder.slice(0, index + 1))} aria-current={index === folder.length - 1 ? 'page' : undefined}>{folderLabel(part, folder[0])}</button></span>)}</nav>}
      {isChilenidad && folder.length > 0 && <button className="gallery-back" onClick={() => openFolder(folder.slice(0, -1))}>← Volver a las carpetas</button>}
      {browsingFolders && <div className="gallery-folders">{folders.map(name => <button className="gallery-folder" key={name} onClick={() => openFolder([...folder, name])} aria-label={`Abrir carpeta ${folderLabel(name, folder[0])}`}><svg width="52" height="44" viewBox="0 0 52 44" fill="none" aria-hidden="true"><path d="M3 12V7a4 4 0 0 1 4-4h12l6 7h20a4 4 0 0 1 4 4v23a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V12Z" fill="currentColor"/><path d="M3 15h46" stroke="white" strokeOpacity=".5" strokeWidth="2"/></svg><strong>{folderLabel(name, folder[0])}</strong><span aria-hidden="true">→</span></button>)}</div>}
      <div className="gallery-grid" key={`${category}/${folder.join('/')}`}>
{visible.map((item, index) => <button className="gallery-card" key={item.src} style={{ animationDelay: `${index * 65}ms` }} onClick={() => { setSelected(index); dialog.current?.showModal(); }} aria-label={`Ampliar: ${item.alt}`}><div className="gallery-image gallery-image-original">{failed.includes(item.src) ? <span className="gallery-unavailable">Imagen no disponible</span> : <img src={item.src} alt={item.alt} loading={index < 2 ? 'eager' : 'lazy'} onError={() => setFailed(values => [...values, item.src])} />}<span className="gallery-expand" aria-hidden="true">↗</span></div></button>)}</div>
      <p className="gallery-reference" role="status">{browsingFolders ? 'Elige una carpeta para ver sus fotografías.' : visible.length === 0 ? `Próximamente: fotografías ${category === 'Todas' ? 'de nuestras actividades' : `de ${category}`}.` : 'Momentos de nuestra comunidad.'}</p>
    </section>
    <footer className="gallery-footer"><span>Colegio JMS</span><span>Educando para el futuro.</span><a href="#galeria">Volver arriba ↑</a></footer>
    {photo && <dialog ref={dialog} className="gallery-dialog" aria-labelledby="photo-title" onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } }}><button className="gallery-close" onClick={close} aria-label="Cerrar imagen" autoFocus>×</button><div className="gallery-viewer"><div className="gallery-full-image" key={photo.src}>{failed.includes(photo.src) ? <p>Esta imagen no está disponible en este momento.</p> : <img src={photo.src} alt={photo.alt} onError={() => setFailed(values => [...values, photo.src])} />}</div><div className="gallery-viewer-bar"><h2 id="photo-title">{photo.category}</h2><div className="gallery-viewer-controls"><button onClick={() => move(-1)} aria-label="Imagen anterior">←</button><button onClick={() => move(1)} aria-label="Imagen siguiente">→</button></div></div></div></dialog>}
  </main>;
}
export default function Home() { return GALLERY_ENABLED ? <Gallery /> : <SchoolHome />; }
