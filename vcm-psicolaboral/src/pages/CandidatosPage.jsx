import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import CandidatoCard from "../components/CandidatoCard.jsx";
import { FAMILIAS_CARGO } from "../data/datosFicticios.js";

export default function CandidatosPage() {
  const { candidatos, solicitudes, puede, eliminarCandidato } = useApp();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [familia, setFamilia] = useState("Todas las familias");

  const filtrados = candidatos.filter((candidato) => {
    const texto = `${candidato.nombre} ${candidato.cargo} ${candidato.correo}`;
    const coincideBusqueda = texto
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());
    const coincideFamilia =
      familia === "Todas las familias" || candidato.familia === familia;
    return coincideBusqueda && coincideFamilia;
  });

  const estadoDe = (idCandidato) => {
    const solicitud = solicitudes.find(
      (item) => item.candidatoId === idCandidato
    );
    return solicitud ? solicitud.estado : "Sin solicitud";
  };

  const eliminar = (candidato) => {
    const tieneSolicitud = solicitudes.some(
      (item) => item.candidatoId === candidato.id
    );
    const mensaje = tieneSolicitud
      ? `¿Eliminar a ${candidato.nombre} y sus solicitudes asociadas?`
      : `¿Eliminar a ${candidato.nombre}?`;
    if (window.confirm(mensaje)) {
      eliminarCandidato(candidato.id);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
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
          <div>
            <span className="badge text-bg-secondary">
              Solo consulta: rol Evaluador
            </span>
          </div>
        )}
      </div>

      <div className="row g-2 mb-4">
        <div className="col-12 col-md-8">
          <label className="visually-hidden" htmlFor="buscar-candidato">
            Buscar candidato
          </label>
          <input
            id="buscar-candidato"
            className="form-control"
            placeholder="Buscar por nombre, cargo o correo..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="visually-hidden" htmlFor="filtrar-familia">
            Filtrar por familia de cargo
          </label>
          <select
            id="filtrar-familia"
            className="form-select"
            value={familia}
            onChange={(evento) => setFamilia(evento.target.value)}
          >
            <option>Todas las familias</option>
            {FAMILIAS_CARGO.map((opcion) => (
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
            <CandidatoCard
              key={candidato.id}
              nombre={candidato.nombre}
              cargo={candidato.cargo}
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
                      onClick={() => eliminar(candidato)}
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
    </>
  );
}
