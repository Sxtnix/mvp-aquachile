import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AvisoSimulacion from "../components/AvisoSimulacion.jsx";
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">Candidatos</h1>
          <p className="text-secondary mb-0">
            {filtrados.length} de {candidatos.length} registros
          </p>
        </div>

        {puede("crearCandidato") ? (
          <Link to="/candidatos/nuevo" className="btn btn-marca">
            Registrar candidato
          </Link>
        ) : (
          <span className="badge text-bg-secondary">
            {puede("editarCandidato") ? "Solo consulta" : "Sin permisos de edición"}
          </span>
        )}
      </div>

      <AvisoSimulacion />

      <div className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <label className="visually-hidden" htmlFor="cand-texto">
            Buscar candidato
          </label>
          <input
            id="cand-texto"
            className="form-control"
            placeholder="Buscar por nombre, cargo o correo..."
            value={filtros.texto}
            onChange={cambiar("texto")}
          />
        </div>

        <div className="col-6 col-md-3">
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

        <div className="col-6 col-md-4">
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
      </div>

      {filtrados.length === 0 ? (
        <div className="alert alert-secondary">
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
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => navigate(`/candidatos/${candidato.id}`)}
                  >
                    {puede("editarCandidato") ? "Editar" : "Ver ficha"}
                  </button>

                  {puede("eliminarCandidato") ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setPorEliminar(candidato)}
                    >
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
          porEliminar
            ? `¿Eliminar a ${porEliminar.nombre}? También se eliminarán sus solicitudes y evaluaciones asociadas. Esta acción no se puede deshacer.`
            : ""
        }
        etiquetaConfirmar="Eliminar"
        alConfirmar={confirmarEliminacion}
        alCancelar={() => setPorEliminar(null)}
      />
    </>
  );
}
