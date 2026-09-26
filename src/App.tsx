import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Itineraries from "./pages/Itineraries";
import TravelOffers from "./pages/TravelOffers";
import AppLayout from "./components/layout/AppLayout";
import NewItinerary from "./pages/NewItinerary";
import ItineraryDetail from "./pages/ItineraryDetail";
import { useAuth } from "./context/AuthContext";
import AiPlanner from "./pages/AiPlanner";
import Destinos from "./pages/Destinos/Destinos";
import NuevoDestino from "./pages/Destinos/NuevoDestino";
import DetalleDestino from "./pages/Destinos/DetalleDestino";
import Plantillas from "./pages/Plantillas/Plantillas";
import NuevaPlantilla from "./pages/Plantillas/NuevaPlantilla";
import Configuracion from "./pages/Configuracion/Configuracion";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Placeholder() {
  return (
    <div className="p-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Próximamente</h1>

        <p className="text-slate-500 mt-2">
          Esta sección la construiremos próximamente.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/clientes" element={<Clients />} />

        <Route path="/itinerarios" element={<Itineraries />} />
        <Route path="/itinerarios/nuevo" element={<NewItinerary />} />
        <Route path="/itinerarios/:id" element={<ItineraryDetail />} />
        <Route path="/itinerarios/ia" element={<AiPlanner />} />
        <Route path="/ofertas" element={<TravelOffers />} />

        <Route path="/destinos" element={<Destinos />} />
        <Route path="/destinos/nuevo" element={<NuevoDestino />} />
        <Route path="/destinos/:id" element={<DetalleDestino />} />

        <Route path="/plantillas" element={<Plantillas />} />
        <Route path="/plantillas/nueva" element={<NuevaPlantilla />} />
        
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
