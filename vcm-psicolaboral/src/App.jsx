import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import PortalLayout from "./components/PortalLayout.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import CandidatoFormPage from "./pages/CandidatoFormPage.jsx";
import CandidatosPage from "./pages/CandidatosPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NoEncontradaPage from "./pages/NoEncontradaPage.jsx";
import OfertaFormPage from "./pages/OfertaFormPage.jsx";
import OfertasPage from "./pages/OfertasPage.jsx";
import PortalOfertasPage from "./pages/PortalOfertasPage.jsx";
import PostulacionPage from "./pages/PostulacionPage.jsx";
import PostulacionesPage from "./pages/PostulacionesPage.jsx";
import SolicitudDetallePage from "./pages/SolicitudDetallePage.jsx";
import SolicitudFormPage from "./pages/SolicitudFormPage.jsx";
import SolicitudesPage from "./pages/SolicitudesPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PortalLayout />}>
        <Route path="/postular" element={<PortalOfertasPage />} />
        <Route path="/postular/:ofertaId" element={<PostulacionPage />} />
      </Route>

      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/candidatos" element={<CandidatosPage />} />
        <Route path="/candidatos/nuevo" element={<CandidatoFormPage />} />
        <Route path="/candidatos/:id" element={<CandidatoFormPage />} />
        <Route path="/solicitudes" element={<SolicitudesPage />} />
        <Route path="/solicitudes/nueva" element={<SolicitudFormPage />} />
        <Route path="/solicitudes/:id" element={<SolicitudDetallePage />} />
        <Route path="/ofertas" element={<OfertasPage />} />
        <Route path="/ofertas/nueva" element={<OfertaFormPage />} />
        <Route path="/ofertas/:id" element={<OfertaFormPage />} />
        <Route path="/postulaciones" element={<PostulacionesPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Routes>
  );
}
