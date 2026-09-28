import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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

import Configuracion from "./pages/Configuracion";
import Agenda from "./pages/Agenda";
import Reservations from "./pages/Reservations";
import Resources from "./pages/Resources";

// =========================================================
// RUTA PROTEGIDA
// =========================================================

function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Cargando...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <Routes>
      {/* =====================================================
          RUTA PRINCIPAL
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* =====================================================
          RUTAS PÚBLICAS
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* =====================================================
          RUTAS PROTEGIDAS
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Clientes */}

        <Route
          path="/clientes"
          element={<Clients />}
        />

        {/* Itinerarios */}

        <Route
          path="/itinerarios"
          element={<Itineraries />}
        />

        <Route
          path="/itinerarios/nuevo"
          element={<NewItinerary />}
        />

        <Route
          path="/itinerarios/:id"
          element={<ItineraryDetail />}
        />

        <Route
          path="/itinerarios/ia"
          element={<AiPlanner />}
        />

        {/* Ofertas */}

        <Route
          path="/ofertas"
          element={<TravelOffers />}
        />

        {/* Destinos */}

        <Route
          path="/destinos"
          element={<Destinos />}
        />

        <Route
          path="/destinos/nuevo"
          element={<NuevoDestino />}
        />

        <Route
          path="/destinos/:id"
          element={<DetalleDestino />}
        />

        {/* Plantillas */}

        <Route
          path="/plantillas"
          element={<Plantillas />}
        />

        <Route
          path="/plantillas/nueva"
          element={<NuevaPlantilla />}
        />

        {/* Agenda */}

        <Route
          path="/agenda"
          element={<Agenda />}
        />

        {/* Reservas */}

        <Route
          path="/reservas"
          element={<Reservations />}
        />

        {/* Recursos */}

        <Route
          path="/recursos"
          element={<Resources />}
        />

        {/* Configuración */}

        <Route
          path="/configuracion"
          element={<Configuracion />}
        />
      </Route>

      {/* =====================================================
          RUTA NO ENCONTRADA
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;