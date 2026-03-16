import { Navigate, Route, Routes } from "react-router-dom";

import { ROUTES } from "./constants/routes";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ParticipantsPage from "./pages/ParticipantsPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to={ROUTES.PARTICIPANTS} replace />} />
        <Route path={ROUTES.PARTICIPANTS.slice(1)} element={<ParticipantsPage />} />
        <Route path={ROUTES.DASHBOARD.slice(1)} element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
