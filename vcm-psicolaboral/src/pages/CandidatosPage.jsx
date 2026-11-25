import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AvisoSimulacion from "../components/AvisoSimulacion.jsx";
import BarraFiltros from "../components/BarraFiltros.jsx";
import BuscadorExpandible from "../components/BuscadorExpandible.jsx";
import DialogoConfirmar from "../components/DialogoConfirmar.jsx";
import FichaCandidato from "../components/FichaCandidato.jsx";
import { FAMILIAS_CARGO, ORIGENES } from "../data/catalogos.js";
import { candidatosFiltrados } from "../utils/selectores.js";

export default function CandidatosPage() {
  const { candidatos, solicitudes, puede, dispatch } = useApp();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    texto: "",
    familia: "",
    origen: "",
  });
  const [porEliminar, setPorEliminar] = useState(null);

  const cambiar = (campo) => (evento) =>
    setFiltros((actual) => ({ ...actual, [campo]: evento.target.value }));

  const filtrados = candidatosFiltrados(candidatos, filtros);
  const hayFiltros = Object.values(filtros).some(Boolean);

  const estadoDe = (idCandidato) => {
    const solicitud = solicitudes.find(
      (item) => item.candidatoId === idCandidato
    );
    return solicitud ? solicitud.estado : "Sin solicitud";
  };

  const confirmarEliminacion = () => {
    if (!porEliminar) return;
    dispatch({ type: "eliminar-candidato", id: porEliminar.id });
    setPorEliminar(null);
  };

  return (
    <>
      <header className="encabezado-pagina mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="eyebrow">
              <i className="bi bi-people" aria-hidden="true" />
              Registro de postulantes
            </span>
            <h1 className="h3 mb-1">Candidatos</h1>
            <p className="text-secondary mb-0">
              {filtrados.length} de {candidatos.length} registros
            </p>
          </div>

          {puede("crearCandidato") ? (
            <Link to="/candidatos/nuevo" className="btn btn-marca">
              <i className="bi bi-person-plus me-1" aria-hidden="true" />
              Registrar candidato
            </Link>
          ) : (
            <span className="badge-vc estado-sin-solicitud align-self-md-center">
              <i className="bi bi-lock" aria-hidden="true" />
              {puede("editarCandidato")
                ? "Solo consulta"
                : "Sin permisos de edición"}
            </span>
          )}
        </div>
      </header>

      <AvisoSimulacion />

      <BarraFiltros
        resumen={
          <>
            <i className="bi bi-people me-1" aria-hidden="true" />
            {filtrados.length} de {candidatos.length} candidatos
          </>
        }
        hayFiltros={hayFiltros}
        alLimpiar={() => setFiltros({ texto: "", familia: "", origen: "" })}
        etiqueta="Filtros de candidatos"
      >
        <BuscadorExpandible
          id="cand-texto"
          etiqueta="Buscar candidato"
          placeholder="Buscar por nombre, cargo o correo…"
          valor={filtros.texto}
          alCambiar={cambiar("texto")}
          alLimpiar={() =>
            setFiltros((actual) => ({ ...actual, texto: "" }))
          }
        />

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="cand-familia">
            Familia de cargo
          </label>
          <select
            id="cand-familia"
            className="form-select"
            value={filtros.familia}
            onChange={cambiar("familia")}
          >
            <option value="">Todas las familias</option>
            {FAMILIAS_CARGO.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="cand-origen">
            Origen
          </label>
          <select
            id="cand-origen"
            className="form-select"
            value={filtros.origen}
            onChange={cambiar("origen")}
          >
            <option value="">Todos los orígenes</option>
            {ORIGENES.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>
      </BarraFiltros>

      {filtrados.length === 0 ? (
        <div className="alert alert-secondary d-flex align-items-center gap-2">
          <i className="bi bi-search" aria-hidden="true" />
          No hay candidatos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="row g-3">
          {filtrados.map((candidato) => (
            <FichaCandidato
              key={candidato.id}
              nombre={candidato.nombre}
              cargo={candidato.cargo}
              familia={candidato.familia}
              ubicacion={candidato.ubicacion}
              estado={estadoDe(candidato.id)}
              correo={candidato.correo}
              telefono={candidato.telefono}
              acciones={
                <>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-marca"
                    onClick={() => navigate(`/candidatos/${candidato.id}`)}
                  >
                    <i
                      className={`bi ${
                        puede("editarCandidato") ? "bi-pencil" : "bi-eye"
                      } me-1`}
                      aria-hidden="true"
                    />
                    {puede("editarCandidato") ? "Editar" : "Ver ficha"}
                  </button>

                  {puede("eliminarCandidato") ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setPorEliminar(candidato)}
                    >
                      <i className="bi bi-trash me-1" aria-hidden="true" />
                      Eliminar
                    </button>
                  ) : null}
                </>
              }
            />
          ))}
        </div>
      )}

      <DialogoConfirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar candidato"
        mensaje={
          porEliminar ? (
            <>
              ¿Eliminar a <strong>{porEliminar.nombre}</strong>? También se
              eliminarán sus solicitudes y evaluaciones asociadas. Esta acción
              no se puede deshacer.
            </>
          ) : (
            ""
          )
        }
        etiquetaConfirmar="Eliminar"
        alConfirmar={confirmarEliminacion}
        alCancelar={() => setPorEliminar(null)}
      />
    </>
  );
}
