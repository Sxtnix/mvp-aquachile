CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('ANALISTA', 'EVALUADOR', 'JEFATURA')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TIMESTAMPTZ NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ofertas (
  id SERIAL PRIMARY KEY,
  cargo TEXT NOT NULL,
  familia TEXT NOT NULL,
  departamento TEXT NOT NULL DEFAULT '',
  ubicacion TEXT NOT NULL DEFAULT '',
  modalidad TEXT NOT NULL DEFAULT 'Presencial',
  descripcion TEXT NOT NULL DEFAULT '',
  funciones TEXT NOT NULL DEFAULT '',
  requisitos TEXT NOT NULL DEFAULT '',
  beneficios TEXT NOT NULL DEFAULT '',
  sueldo TEXT NOT NULL DEFAULT '',
  vacantes INTEGER NOT NULL DEFAULT 1,
  fecha_publicacion TEXT,
  fecha_cierre TEXT,
  estado TEXT NOT NULL DEFAULT 'Borrador'
    CHECK (estado IN ('Borrador', 'Publicada', 'Cerrada')),
  responsable TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidatos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  telefono TEXT NOT NULL DEFAULT '',
  cargo TEXT NOT NULL DEFAULT '',
  familia TEXT NOT NULL DEFAULT '',
  origen TEXT NOT NULL DEFAULT 'Externo',
  ubicacion TEXT NOT NULL DEFAULT '',
  departamento TEXT NOT NULL DEFAULT '',
  requiere_referencia BOOLEAN NOT NULL DEFAULT FALSE,
  canal TEXT NOT NULL DEFAULT 'Portal',
  fecha_postulacion TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carpetas_cv (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre_postulante TEXT NOT NULL,
  candidato_id INTEGER REFERENCES candidatos(id) ON DELETE SET NULL,
  creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS archivos_cv (
  id SERIAL PRIMARY KEY,
  carpeta_id INTEGER NOT NULL REFERENCES carpetas_cv(id) ON DELETE CASCADE,
  nombre_original TEXT NOT NULL,
  mime TEXT NOT NULL,
  tamano INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  contenido BYTEA NOT NULL,
  subido_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS postulaciones (
  id SERIAL PRIMARY KEY,
  folio TEXT NOT NULL UNIQUE,
  oferta_id INTEGER NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
  candidato_id INTEGER NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  carpeta_cv_id INTEGER REFERENCES carpetas_cv(id) ON DELETE SET NULL,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Recibida',
  consentimiento BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (oferta_id, candidato_id)
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id SERIAL PRIMARY KEY,
  candidato_id INTEGER NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  postulacion_id INTEGER REFERENCES postulaciones(id) ON DELETE SET NULL,
  oferta_id INTEGER REFERENCES ofertas(id) ON DELETE SET NULL,
  cargo TEXT NOT NULL DEFAULT '',
  familia TEXT NOT NULL DEFAULT '',
  fecha_solicitud TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'En proceso', 'Finalizada')),
  responsable TEXT,
  prioridad TEXT NOT NULL DEFAULT 'Media'
    CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  observaciones TEXT NOT NULL DEFAULT '',
  fecha_entrevista TEXT NOT NULL DEFAULT '',
  fecha_informe TEXT NOT NULL DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL UNIQUE REFERENCES solicitudes(id) ON DELETE CASCADE,
  fecha_evaluacion TEXT NOT NULL,
  resultado TEXT NOT NULL,
  categoria TEXT NOT NULL,
  observaciones TEXT NOT NULL DEFAULT '',
  evaluador TEXT NOT NULL DEFAULT '',
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bitacora (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  responsable TEXT NOT NULL DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analisis_ia (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  puntaje INTEGER,
  resumen TEXT NOT NULL DEFAULT '',
  formacion TEXT NOT NULL DEFAULT '',
  experiencia TEXT NOT NULL DEFAULT '',
  habilidades JSONB NOT NULL DEFAULT '[]'::jsonb,
  requisitos JSONB NOT NULL DEFAULT '[]'::jsonb,
  preguntas JSONB NOT NULL DEFAULT '[]'::jsonb,
  faltantes JSONB NOT NULL DEFAULT '[]'::jsonb,
  limitaciones TEXT NOT NULL DEFAULT '',
  modelo TEXT NOT NULL DEFAULT '',
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  creado_por TEXT NOT NULL DEFAULT '',
  revisado_por TEXT,
  revisado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_responsable ON solicitudes(responsable);
CREATE INDEX IF NOT EXISTS idx_ofertas_estado ON ofertas(estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_oferta ON postulaciones(oferta_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_solicitud ON bitacora(solicitud_id);
