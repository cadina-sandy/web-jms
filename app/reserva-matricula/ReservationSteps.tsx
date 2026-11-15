'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const schoolProfileUrl = 'https://mime.mineduc.cl/mvc/ficha?rbd=9122';
const educationProjectUrl = 'https://wwwfs.mineduc.cl/Archivos/infoescuelas/documentos/9122/ProyectoEducativo9122.pdf';
const schoolRegulationsUrl = 'https://wwwfs.mineduc.cl/Archivos/infoescuelas/documentos/9122/ReglamentodeConvivencia9122.pdf';

const enrollmentStaff = ['Paula Santander', 'Sandy Cadín', 'Jeannette Montanares', 'Jaime Villalobos']
  .map((name) => ({ value: name, label: name }));

const enrollmentCourses = [
  'Pre-kínder',
  'Kínder',
  ...Array.from({ length: 8 }, (_, index) => index + 1)
    .flatMap((grade) => ['A', 'B'].map((section) => `${grade}°${section}`)),
];

const enrollmentDateFormat = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const nationalityCountries = [
  'Chile',
  'Argentina',
  'Bolivia',
  'Brasil',
  'Colombia',
  'Ecuador',
  'EE. UU.',
  'España',
  'Haití',
  'México',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
];

const guardianRelationships = ['Madre', 'Padre', 'Hermano/a', 'Tío/a', 'Abuelo/a', 'Tutor', 'Otro'];

const guardianEducationLevels = [
  'Básica',
  'Media / Científico-Humanista',
  'Media / Técnico',
  'Técnico nivel superior',
  'Universidad incompleta',
  'Universidad completa',
  'Máster / Magíster',
  'Doctorado',
];

const householdOptions = [
  'Solo madre',
  'Solo padre',
  'Ambos padres',
  'Hermano/os',
  'Abuela/o',
  'Primos',
  'Otro',
];

const householdSizes = Array.from({ length: 10 }, (_, index) => index + 1);

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
            visible={identification === alternateId}
          />
        </div>
        {children}
      </div>
    </>
  );
}

function NationalityField({ name }: { name: string }) {
  return (
    <label>
      Nacionalidad
      <select name={name} defaultValue="">
        <option value="" disabled>Selecciona un país</option>
        {nationalityCountries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
    </label>
  );
}

function RelationshipField({ name }: { name: string }) {
  return (
    <label>
      Parentesco
      <select name={name} defaultValue="">
        <option value="" disabled>Selecciona un parentesco</option>
        {guardianRelationships.map((relationship) => (
          <option key={relationship} value={relationship}>{relationship}</option>
        ))}
      </select>
    </label>
  );
}

function PhoneField({
  id,
  name,
  label = 'Celular',
  autoComplete = 'tel-national',
}: {
  id: string;
  name: string;
  label?: string;
  autoComplete?: string;
}) {
  const prefixId = `prefijo-${id}`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div className="guardian-phone-fields">
        <span id={prefixId}>+56</span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          aria-describedby={prefixId}
          placeholder="978978987"
          maxLength={9}
          pattern="[0-9]{9}"
          onChange={(event) => {
            event.currentTarget.value = event.currentTarget.value.replace(/[^0-9]/g, '');
          }}
        />
      </div>
    </div>
  );
}

function EmailFields({ guardian = false }: { guardian?: boolean }) {
  const label = guardian ? 'Correo apoderado' : 'Correo del estudiante';
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

function StudentHouseholdField() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  return (
    <fieldset className="student-household">
      <legend>¿Con quién vive el estudiante?</legend>
      <details>
        <summary>{selectedOptions.join(', ') || 'Selecciona una o más opciones'}</summary>
        <div className="household-options">
          {householdOptions.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                name="conQuienVive"
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={(event) => {
                  const { checked } = event.currentTarget;
                  setSelectedOptions((current) => checked
                    ? [...current, option]
                    : current.filter((selected) => selected !== option));
                }}
              />
              {option}
            </label>
          ))}
        </div>
      </details>
    </fieldset>
  );
}

function SelectWithOtherField({
  id,
  name,
  label,
  placeholder,
  manualPlaceholder,
  options,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  manualPlaceholder: string;
  options: { value: string; label: string }[];
}) {
  const [selection, setSelection] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selection === 'otro') inputRef.current?.focus();
  }, [selection]);

  return (
    <div className="select-with-other">
      <label htmlFor={id}>{label}</label>
      {selection === 'otro' ? (
        <>
          <input type="hidden" name={name} value="otro" />
          <input
            id={id}
            ref={inputRef}
            name={`${name}Otro`}
            type="text"
            placeholder={manualPlaceholder}
          />
          <button
            type="button"
            onClick={() => {
              setSelection('');
              requestAnimationFrame(() => selectRef.current?.focus());
            }}
          >
            Volver a la lista
          </button>
        </>
      ) : (
        <select
          id={id}
          ref={selectRef}
          name={name}
          value={selection}
          onChange={(event) => setSelection(event.currentTarget.value)}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
          <option value="otro">Otro</option>
        </select>
      )}
    </div>
  );
}

function AuthorizedPickupFields() {
  const [personCount, setPersonCount] = useState(1);
  const newestName = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (personCount > 1) newestName.current?.focus();
  }, [personCount]);

  return (
    <section className="authorized-pickup" aria-labelledby="titulo-personas-autorizadas">
      <h5 id="titulo-personas-autorizadas">Personas autorizadas para retirar al estudiante</h5>
      {Array.from({ length: personCount }, (_, index) => {
        const person = index + 1;
        const fieldName = `personasAutorizadas[${index}]`;

        return (
          <div key={person} className="authorized-person-fields" role="group" aria-label={`Persona autorizada ${person}`}>
            <label>
              Nombre completo
              <input
                ref={person === personCount ? newestName : undefined}
                name={`${fieldName}[nombre]`}
                type="text"
                autoComplete={`section-retiro-${person} name`}
              />
            </label>
            <PhoneField
              id={`telefono-retiro-${person}`}
              name={`${fieldName}[telefono]`}
              label="Teléfono"
              autoComplete={`section-retiro-${person} tel-national`}
            />
            <DocumentNumberFields
              label="RUT"
              numberName={`${fieldName}[rutNumero]`}
              digitName={`${fieldName}[rutDigito]`}
              maxDigits={8}
              enabled
              visible
            />
          </div>
        );
      })}
      <button className="add-authorized-person" type="button" onClick={() => setPersonCount((count) => count + 1)}>
        <span aria-hidden="true">+</span>
        Agregar otra persona
      </button>
    </section>
  );
}

function StudentHealthFields() {
  const [insuranceType, setInsuranceType] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [healthCenter, setHealthCenter] = useState('');

  return (
    <section className="student-health" aria-labelledby="titulo-datos-salud">
      <h4 id="titulo-datos-salud">4. Datos de Salud</h4>
      <div className="student-health-fields">
        <label>
          Tipo de previsión
          <select
            name="saludTipoPrevision"
            value={insuranceType}
            onChange={(event) => setInsuranceType(event.currentTarget.value)}
          >
            <option value="" disabled>Selecciona una previsión</option>
            <option value="fonasa">Fonasa</option>
            <option value="isapre">Isapre</option>
            <option value="otra">Otra</option>
          </select>
        </label>
        <label className="detail-field">
          Otra
          <input name="saludOtraPrevision" type="text" disabled={insuranceType !== 'otra'} />
        </label>
      </div>
      <div className="student-health-fields">
        <label>
          ¿Presenta algún problema de salud diagnosticado por un médico?
          <select
            name="saludTieneDiagnostico"
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.currentTarget.value)}
          >
            <option value="" disabled>Selecciona una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="detail-field">
          ¿Cuál? Especifique
          <input name="saludDetalleDiagnostico" type="text" disabled={diagnosis !== 'si'} />
        </label>
      </div>
      <div className="student-health-fields">
        <label className="health-allergy-field">
          ¿Algún medicamento contraindicado y/o alergia alimentaria?
          <input name="saludMedicamentosContraindicadosOAlergias" type="text" />
        </label>
      </div>
      <div className="student-health-fields">
        <label>
          Consultorio en el cual se atiende
          <select
            name="saludConsultorio"
            value={healthCenter}
            onChange={(event) => setHealthCenter(event.currentTarget.value)}
          >
            <option value="" disabled>Selecciona un consultorio</option>
            <option value="felix-de-amesti">Dr. Félix de Amesti</option>
            <option value="padre-alberto-hurtado">Padre Alberto Hurtado</option>
            <option value="santa-julia">Santa Julia</option>
            <option value="centro-privado">Centro Privado</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="detail-field">
          ¿Cuál? Especifique
          <input name="saludOtroConsultorio" type="text" disabled={healthCenter !== 'otro'} />
        </label>
      </div>
      <div className="student-health-fields">
        <label>
          ¿Tiene impedimento para realizar Educación Física?
          <select name="saludImpedimentoEducacionFisica" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function StudentSchoolHistoryFields() {
  const [repeatedCourse, setRepeatedCourse] = useState('');

  return (
    <section className="student-school-history" aria-labelledby="titulo-antecedentes-escolares">
      <h4 id="titulo-antecedentes-escolares">5. Antecedentes escolares</h4>
      <div className="student-school-fields">
        <label>
          Estudiante nuevo
          <select name="estudianteNuevo" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="detail-field">
          Colegio de procedencia
          <input name="colegioProcedencia" type="text" />
        </label>
      </div>
      <div className="student-school-fields">
        <label>
          Curso repetido
          <select
            name="cursoRepetido"
            value={repeatedCourse}
            onChange={(event) => setRepeatedCourse(event.currentTarget.value)}
          >
            <option value="" disabled>Selecciona una opción</option>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </label>
        <label className="detail-field">
          ¿Cuántas veces?
          <select name="cantidadCursosRepetidos" defaultValue="" disabled={repeatedCourse !== 'si'}>
            <option value="" disabled>Selecciona una cantidad</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="mas-de-4">Más de 4</option>
          </select>
        </label>
      </div>
      <div className="student-school-fields">
        <label>
          ¿Presenta alguna dificultad de aprendizaje? Especifique
          <input name="dificultadAprendizaje" type="text" />
        </label>
        <label className="detail-field">
          ¿Es tratado por algún especialista? Especifique
          <input name="tratamientoEspecialista" type="text" />
        </label>
      </div>
      <div className="student-school-fields">
        <label>
          ¿Pertenece a algún programa de apoyo familiar?
          <select name="programaApoyoFamiliar" defaultValue="">
            <option value="" disabled>Selecciona un programa</option>
            <option value="PRM">PRM</option>
            <option value="PPF">PPF</option>
            <option value="FAE">FAE</option>
            <option value="PIE">PIE</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function PhotoConsentFields({
  guardianName,
  substituteName,
  studentName,
  date,
}: {
  guardianName: string;
  substituteName: string;
  studentName: string;
  date: string;
}) {
  return (
    <section className="photo-consent" aria-labelledby="titulo-autorizacion-imagen">
      <h4 id="titulo-autorizacion-imagen">AUTORIZACIÓN DE USO DE IMAGEN</h4>
      <p>
        Yo{' '}
        <select name="autorizacionImagenApoderado" aria-label="Apoderado que autoriza" defaultValue="">
          <option value="" disabled>Selecciona un apoderado</option>
          <option value="apoderado" disabled={!guardianName}>{guardianName || 'Apoderado'}</option>
          <option value="apoderado-suplente" disabled={!substituteName}>{substituteName || 'Apoderado suplente'}</option>
        </select>
        , apoderado de <strong>{studentName || 'nombre del estudiante'}</strong>, autorizo al
        establecimiento a utilizar fotografías y/o videos del estudiante con fines educativos
        y de difusión institucional, resguardando su privacidad y bienestar.
      </p>
      <div className="photo-consent-signature">
        <label>
          Firma
          <input className="signature-name" name="autorizacionImagenFirma" type="text" placeholder="Escribe tu nombre completo" />
        </label>
        <label>
          Fecha
          <input name="autorizacionImagenFecha" type="text" value={date.split('-').reverse().join('/')} readOnly />
        </label>
      </div>
    </section>
  );
}

export default function ReservationSteps() {
  const [open, setOpen] = useState(false);
  const [enrollmentDate, setEnrollmentDate] = useState<string | null>(null);
  const [consentDate, setConsentDate] = useState('');
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentFirstSurname, setStudentFirstSurname] = useState('');
  const [studentSecondSurname, setStudentSecondSurname] = useState('');
  const [guardianFirstName, setGuardianFirstName] = useState('');
  const [guardianLastName, setGuardianLastName] = useState('');
  const [substituteName, setSubstituteName] = useState('');
  const formHeading = useRef<HTMLHeadingElement>(null);
  const studentName = [studentFirstName, studentFirstSurname, studentSecondSurname].map((part) => part.trim()).filter(Boolean).join(' ');
  const guardianName = [guardianFirstName, guardianLastName].map((part) => part.trim()).filter(Boolean).join(' ');

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
                onClick={() => {
                  if (!open && enrollmentDate === null) {
                    const today = enrollmentDateFormat.format(new Date());
                    setEnrollmentDate(today);
                    setConsentDate(today);
                  }
                  setOpen(!open);
                }}
              >Aquí</button></p>
            </li>
            <li>
              <h3>Paso 3</h3>
              <p>Acércate al establecimiento a firmar el consentimiento desde el 2 de diciembre.</p>
            </li>
          </ol>

          <section className="reservation-form" id="formulario-matricula" aria-labelledby="titulo-formulario" hidden={!open}>
            <h3 id="titulo-formulario" ref={formHeading} tabIndex={-1}>Formulario de matrícula 2027</h3>
            <form onSubmit={(event) => event.preventDefault()}>
              <div className="enrollment-header-fields">
                <label>
                  Fecha
                  <input
                    name="fechaMatricula"
                    type="date"
                    value={enrollmentDate ?? ''}
                    onChange={(event) => setEnrollmentDate(event.currentTarget.value)}
                  />
                </label>
                <label>
                  Curso al que se inscribe
                  <select name="curso" defaultValue="">
                    <option value="" disabled>Selecciona un curso</option>
                    {enrollmentCourses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </label>
              </div>
              <h4>1. Datos del estudiante</h4>
              <div className="student-name-fields">
                <label>
                  Nombres
                  <input name="nombres" type="text" value={studentFirstName} onChange={(event) => setStudentFirstName(event.currentTarget.value)} />
                </label>
                <label>
                  Primer Apellido
                  <input name="apellidoPaterno" type="text" value={studentFirstSurname} onChange={(event) => setStudentFirstSurname(event.currentTarget.value)} />
                </label>
                <label>
                  Segundo Apellido
                  <input name="apellidoMaterno" type="text" value={studentSecondSurname} onChange={(event) => setStudentSecondSurname(event.currentTarget.value)} />
                </label>
                <label>
                  Fecha de nacimiento
                  <input name="fechaNacimiento" type="date" autoComplete="bday" />
                </label>
                <label>
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
              </div>
              <IdentificationFields>
                <NationalityField name="nacionalidad" />
                <label className="indigenous-affiliation">
                  <input type="checkbox" role="switch" name="pertenecePuebloOriginario" value="si" />
                  ¿Pertenece a algún pueblo originario?
                </label>
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
              <div className="student-household-fields">
                <StudentHouseholdField />
                <label>
                  Número de personas en el hogar
                  <select name="numeroPersonasHogar" defaultValue="">
                    <option value="" disabled>Selecciona una cantidad</option>
                    {householdSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
              </div>
              <section className="guardian-fields" aria-labelledby="datos-apoderado">
                <h4 id="datos-apoderado">2. Datos del apoderado</h4>
                <div className="guardian-name-fields">
                  <label>
                    Nombres
                    <input name="apoderadoNombres" type="text" value={guardianFirstName} onChange={(event) => setGuardianFirstName(event.currentTarget.value)} />
                  </label>
                  <label>
                    Apellidos
                    <input name="apoderadoApellidos" type="text" value={guardianLastName} onChange={(event) => setGuardianLastName(event.currentTarget.value)} />
                  </label>
                </div>
                <IdentificationFields guardian>
                  <NationalityField name="apoderadoNacionalidad" />
                  <RelationshipField name="apoderadoParentesco" />
                  <PhoneField id="celular-apoderado" name="apoderadoCelular" />
                  <label>
                    Fecha de nacimiento
                    <input name="apoderadoFechaNacimiento" type="date" autoComplete="section-apoderado bday" />
                  </label>
                  <EmailFields guardian />
                  <label>
                    Último nivel de educación cursado
                    <select name="apoderadoNivelEducacion" defaultValue="">
                      <option value="" disabled>Selecciona un nivel</option>
                      {guardianEducationLevels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Situación laboral
                    <select name="apoderadoSituacionLaboral" defaultValue="">
                      <option value="" disabled>Selecciona una opción</option>
                      <option value="Dueña de casa">Dueña de casa</option>
                      <option value="Trabajador independiente">Trabajador independiente</option>
                      <option value="Trabajador dependiente">Trabajador dependiente</option>
                    </select>
                  </label>
                  <label>
                    Lugar de trabajo
                    <select name="apoderadoLugarTrabajo" defaultValue="">
                      <option value="" disabled>Selecciona una opción</option>
                      <option value="Fuera de casa">Fuera de casa</option>
                      <option value="Desde la casa">Desde la casa</option>
                    </select>
                  </label>
                  <label>
                    ¿Posee Registro Social de Hogares?
                    <select name="apoderadoRegistroSocialHogares" defaultValue="">
                      <option value="" disabled>Selecciona una opción</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </IdentificationFields>
                <div className="substitute-guardian-fields">
                  <label>
                    2.1 Nombre completo del apoderado suplente
                    <input
                      name="apoderadoSuplenteNombreCompleto"
                      type="text"
                      autoComplete="section-apoderado-suplente name"
                      value={substituteName}
                      onChange={(event) => setSubstituteName(event.currentTarget.value)}
                    />
                  </label>
                  <div className="student-identification-fields">
                    <RelationshipField name="apoderadoSuplenteParentesco" />
                    <DocumentNumberFields
                      label="RUT"
                      numberName="apoderadoSuplenteRutNumero"
                      digitName="apoderadoSuplenteRutDigito"
                      maxDigits={8}
                      enabled
                      visible
                    />
                    <PhoneField
                      id="celular-apoderado-suplente"
                      name="apoderadoSuplenteCelular"
                      autoComplete="section-apoderado-suplente tel-national"
                    />
                  </div>
                </div>
              </section>
              <h4 className="emergency-heading">3. Situación de Emergencia</h4>
              <div className="emergency-contact-fields">
                <SelectWithOtherField
                  id="emergencia-contacto"
                  name="emergenciaContacto"
                  label="Avisar en caso de emergencia"
                  placeholder="Selecciona un contacto"
                  manualPlaceholder="Escribe el nombre del contacto"
                  options={[
                    { value: 'apoderado', label: guardianName || 'Apoderado' },
                    { value: 'apoderado-suplente', label: substituteName.trim() || 'Apoderado suplente' },
                  ]}
                />
                <PhoneField
                  id="celular-emergencia"
                  name="emergenciaCelular"
                  autoComplete="section-emergencia tel-national"
                />
              </div>
              <AuthorizedPickupFields />
              <StudentHealthFields />
              <p className="enrollment-notice">
                Al completar esta ficha toma conocimiento y acepta el{' '}
                <a className="enrollment-document-link" href={educationProjectUrl} target="_blank" rel="noopener noreferrer">
                  PROYECTO EDUCATIVO INSTITUCIONAL
                </a>{' '}
                y se compromete al cumplimiento de{' '}
                <a className="enrollment-document-link" href={schoolRegulationsUrl} target="_blank" rel="noopener noreferrer">
                  REGLAMENTO INTERNO
                </a>{' '}
                del establecimiento, publicados en{' '}
                <a href={schoolProfileUrl} target="_blank" rel="noopener noreferrer">{schoolProfileUrl}</a>.
                {' '}Se adjunta{' '}
                <a
                  className="enrollment-document-link"
                  href={schoolRegulationsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abre el reglamento completo mientras se adjunta el extracto"
                >
                  EXTRACTO DEL REGLAMENTO INTERNO
                </a>.
                {' '}Declaro que la información proporcionada es fidedigna y que puede ser ratificada.
              </p>
              <StudentSchoolHistoryFields />
              <div className="enrollment-staff">
                <SelectWithOtherField
                  id="funcionario-matricula"
                  name="funcionarioMatricula"
                  label="Nombre de quién matricula (Funcionario colegio JMS)"
                  placeholder="Selecciona un nombre"
                  manualPlaceholder="Escribe el nombre completo"
                  options={enrollmentStaff}
                />
              </div>
              <PhotoConsentFields
                guardianName={guardianName}
                substituteName={substituteName.trim()}
                studentName={studentName}
                date={consentDate}
              />
            </form>
          </section>
        </div>
      </section>
  );
}
