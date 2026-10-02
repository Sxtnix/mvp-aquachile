import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import CandidatoFormPage from "./pages/CandidatoFormPage.jsx";
import CandidatosPage from "./pages/CandidatosPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SolicitudDetallePage from "./pages/SolicitudDetallePage.jsx";
import SolicitudFormPage from "./pages/SolicitudFormPage.jsx";
import SolicitudesPage from "./pages/SolicitudesPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/candidatos" element={<CandidatosPage />} />
        <Route path="/candidatos/nuevo" element={<CandidatoFormPage />} />
        <Route path="/candidatos/:id" element={<CandidatoFormPage />} />
        <Route path="/solicitudes" element={<SolicitudesPage />} />
        <Route path="/solicitudes/nueva" element={<SolicitudFormPage />} />
        <Route path="/solicitudes/:id" element={<SolicitudDetallePage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
