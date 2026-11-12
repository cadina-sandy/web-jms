'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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

function DocumentNumberFields({
  label,
  numberName,
  digitName,
  maxDigits,
  enabled,
  visible,
}: {
  label: string;
  numberName: string;
  digitName: string;
  maxDigits: number;
  enabled: boolean;
  visible: boolean;
}) {
  const [number, setNumber] = useState('');
  const [digit, setDigit] = useState('');

  return (
    <div hidden={!visible}>
      <div className="student-rut-fields">
        <label>
          Número de {label}
          <input
            name={numberName}
            type="text"
            inputMode="numeric"
            disabled={!enabled}
            value={number}
            onChange={(event) => {
              const digits = event.target.value.replace(/[^0-9]/g, '').slice(0, maxDigits);
              setNumber(digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
            }}
          />
        </label>
        <span aria-hidden="true">-</span>
        <label>
          Dígito verificador
          <input
            name={digitName}
            type="text"
            maxLength={1}
            disabled={!enabled}
            value={digit}
            onChange={(event) => setDigit(event.target.value.toUpperCase().replace(/[^0-9K]/g, ''))}
          />
        </label>
      </div>
    </div>
  );
}

function IdentificationFields({ guardian = false, children }: { guardian?: boolean; children?: ReactNode }) {
  const alternateId = guardian ? 'ipa' : 'ipe';
  const alternateLabel = guardian ? 'IPA' : 'IPE';
  const [identification, setIdentification] = useState<'rut' | 'ipe' | 'ipa' | null>(null);

  return (
    <>
      <fieldset>
        <legend>Tipo de identificación</legend>
        <label><input type="radio" name={guardian ? "apoderadoTipoIdentificacion" : "tipoIdentificacion"} value="rut" checked={identification === 'rut'} onChange={() => setIdentification('rut')} /> RUT (Nacional)</label>
        <label><input type="radio" name={guardian ? "apoderadoTipoIdentificacion" : "tipoIdentificacion"} value={alternateId} checked={identification === alternateId} onChange={() => setIdentification(alternateId)} /> {alternateLabel} (Extranjero)</label>
      </fieldset>
      <div className="student-identification-fields">
        <div className="identification-number-fields">
          <DocumentNumberFields
            label="RUT"
            numberName={guardian ? "apoderadoRutNumero" : "rutNumero"}
            digitName={guardian ? "apoderadoRutDigito" : "rutDigito"}
            maxDigits={8}
            enabled={identification === 'rut'}
            visible={identification === null || identification === 'rut'}
          />
          <DocumentNumberFields
            label={alternateLabel}
            numberName={guardian ? "apoderadoIpa" : "ipe"}
            digitName={guardian ? "apoderadoIpaDigito" : "ipeDigito"}
            maxDigits={9}
            enabled={identification === alternateId}
            visible={identification === null || identification === alternateId}
          />
        </div>
        {children}
      </div>
    </>
  );
}

function EmailFields({ guardian = false }: { guardian?: boolean }) {
  const label = guardian ? 'Correo del apoderado' : 'Correo del estudiante';
  const emailId = guardian ? 'correo-apoderado' : 'correo-estudiante';

  return (
    <div className="student-email-field">
      <label htmlFor={emailId}>{label}</label>
      <div className="student-email-fields">
        <input id={emailId} name={guardian ? "apoderadoCorreoUsuario" : "correoUsuario"} type="text" inputMode="email" autoCapitalize="none" spellCheck={false} pattern="[^@\s]+" title="Escribe solo la parte anterior a la arroba" />
        <select name={guardian ? "apoderadoCorreoDominio" : "correoDominio"} defaultValue="" aria-label={`Dominio de ${label.toLowerCase()}`}>
          <option value="" disabled>Dominio</option>
          <option value="gmail.com">@gmail.com</option>
          <option value="hotmail.com">@hotmail.com</option>
          <option value="yahoo.com">@yahoo.com</option>
        </select>
      </div>
    </div>
  );
}

export default function ReservationSteps() {
  const [open, setOpen] = useState(false);
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
                <label>Primer Apellido<input name="apellidoPaterno" type="text" /></label>
                <label>Segundo Apellido<input name="apellidoMaterno" type="text" /></label>
              </div>
              <IdentificationFields>
                <label className="student-gender-field">
                  Género
                  <select name="genero" defaultValue="">
                    <option value="" disabled>Selecciona una opción</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="no-binario">No binario</option>
                    <option value="prefiero-no-responder">Prefiero no responder</option>
                  </select>
                </label>
                <EmailFields />
              </IdentificationFields>
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
              <section className="guardian-fields" aria-labelledby="datos-apoderado">
                <h4 id="datos-apoderado">Datos del apoderado</h4>
                <div className="guardian-name-fields">
                  <label>Nombres<input name="apoderadoNombres" type="text" /></label>
                  <label>Apellidos<input name="apoderadoApellidos" type="text" /></label>
                </div>
                <IdentificationFields guardian>
                  <EmailFields guardian />
                  <div>
                    <label htmlFor="celular-apoderado">Celular</label>
                    <div className="guardian-phone-fields">
                      <span id="prefijo-celular-apoderado">+56</span>
                      <input
                        id="celular-apoderado"
                        name="apoderadoCelular"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        aria-describedby="prefijo-celular-apoderado"
                        placeholder="978978987"
                        maxLength={9}
                        pattern="[0-9]{9}"
                        onChange={(event) => {
                          event.currentTarget.value = event.currentTarget.value.replace(/[^0-9]/g, '');
                        }}
                      />
                    </div>
                  </div>
                </IdentificationFields>
              </section>
            </form>
          </section>
        </div>
      </section>
  );
}
