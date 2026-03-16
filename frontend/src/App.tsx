import { Navigate, Route, Routes } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ROUTES } from "./constants/routes";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ParticipantsPage from "./pages/ParticipantsPage";

import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to={ROUTES.PARTICIPANTS} replace />} />
          <Route path={ROUTES.PARTICIPANTS.slice(1)} element={<ParticipantsPage />} />
          <Route path={ROUTES.DASHBOARD.slice(1)} element={<DashboardPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
