'use client';

import { useEffect, useRef, useState } from 'react';

const comunasMetropolitanas = [
  'Alhué',
  'Buin',
  'Calera de Tango',
  'Cerrillos',
  'Cerro Navia',
  'Colina',
  'Conchalí',
  'Curacaví',
  'El Bosque',
  'El Monte',
  'Estación Central',
  'Huechuraba',
  'Independencia',
  'Isla de Maipo',
  'La Cisterna',
  'La Florida',
  'La Granja',
  'La Pintana',
  'La Reina',
  'Lampa',
  'Las Condes',
  'Lo Barnechea',
  'Lo Espejo',
  'Lo Prado',
  'Macul',
  'Maipú',
  'María Pinto',
  'Melipilla',
  'Ñuñoa',
  'Padre Hurtado',
  'Paine',
  'Pedro Aguirre Cerda',
  'Peñaflor',
  'Peñalolén',
  'Pirque',
  'Providencia',
  'Pudahuel',
  'Puente Alto',
  'Quilicura',
  'Quinta Normal',
  'Recoleta',
  'Renca',
  'San Bernardo',
  'San Joaquín',
  'San José de Maipo',
  'San Miguel',
  'San Pedro',
  'San Ramón',
  'Santiago',
  'Talagante',
  'Tiltil',
  'Vitacura',
];

export default function ReservationSteps() {
  const [open, setOpen] = useState(false);
  const [identification, setIdentification] = useState<'rut' | 'pii' | null>(null);
  const [rutNumber, setRutNumber] = useState('');
  const [rutDigit, setRutDigit] = useState('');
  const formHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (open) formHeading.current?.focus();
  }, [open]);

  return (
      <section className="section reservation-steps" id="pasos-matricula" aria-labelledby="titulo-pasos-matricula">
        <div className="shell">
          <h2 id="titulo-pasos-matricula">Pasos a seguir<br /> <em>para reservar tu matricula</em></h2>
          <ol className="reservation-step-list">
            <li>
              <h3>Paso 1</h3>
              <p>Postula al estudiante al establecimiento Julio Montt a través del <a href="https://www.sistemadeadmisionescolar.cl/" target="_blank" rel="noreferrer">Sistema de Admisión Escolar (SAE)</a>.</p>
            </li>
            <li>
              <h3>Paso 2</h3>
              <p>Completa el formulario de Matrícula 2027 <button
                type="button"
                className="reservation-form-trigger"
                aria-expanded={open}
                aria-controls="formulario-matricula"
                onClick={() => setOpen(!open)}
              >Aquí</button></p>
            </li>
            <li>
              <h3>Paso 3</h3>
              <p>Acércate al establecimiento a firmar el consentimiento desde el 2 de diciembre.</p>
            </li>
          </ol>

          <section className="reservation-form" id="formulario-matricula" aria-labelledby="titulo-formulario" hidden={!open}>
            <h3 id="titulo-formulario" ref={formHeading} tabIndex={-1}>Formulario de matricula 2027</h3>
            <form onSubmit={(event) => event.preventDefault()}>
              <h4>Datos del estudiante</h4>
              <div className="student-name-fields">
                <label>Nombres<input name="nombres" type="text" /></label>
                <label>Apellido Paterno<input name="apellidoPaterno" type="text" /></label>
                <label>Apellido Materno<input name="apellidoMaterno" type="text" /></label>
              </div>
              <fieldset>
                <legend>Tipo de identificación</legend>
                <label><input type="radio" name="tipoIdentificacion" value="rut" checked={identification === 'rut'} onChange={() => setIdentification('rut')} /> RUT</label>
                <label><input type="radio" name="tipoIdentificacion" value="pii" checked={identification === 'pii'} onChange={() => setIdentification('pii')} /> PII</label>
              </fieldset>
              <div hidden={identification !== 'rut'}>
                <div className="student-rut-fields">
                  <label>
                    Número de RUT
                    <input name="rutNumero" type="text" inputMode="numeric" maxLength={8} disabled={identification !== 'rut'}
                      value={rutNumber} onChange={(event) => setRutNumber(event.target.value.replace(/[^0-9]/g, ''))} />
                  </label>
                  <span aria-hidden="true">-</span>
                  <label>
                    Dígito verificador
                    <input name="rutDigito" type="text" maxLength={1} disabled={identification !== 'rut'}
                      value={rutDigit} onChange={(event) => setRutDigit(event.target.value.toUpperCase().replace(/[^0-9K]/g, ''))} />
                  </label>
                </div>
              </div>
              <label hidden={identification !== 'pii'}>Número de PII<input name="pii" type="text" disabled={identification !== 'pii'} /></label>
              <div className="student-address-fields">
                <label>
                  Dirección (Calle y Número)
                  <input name="direccion" type="text" autoComplete="address-line1" />
                </label>
                <label>
                  Block o Torre
                  <input name="blockOTorre" type="text" />
                </label>
                <label>
                  N° de departamento
                  <input name="departamento" type="text" />
                </label>
                <label>
                  Comuna
                  <select name="comuna" defaultValue="" autoComplete="address-level2">
                    <option value="" disabled>Selecciona una comuna</option>
                    {comunasMetropolitanas.map((comuna) => (
                      <option key={comuna} value={comuna}>{comuna}</option>
                    ))}
                  </select>
                </label>
              </div>
            </form>
          </section>
        </div>
      </section>
  );
}
