import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/useAuth";
import { Navbar } from "./NavBar";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </>
  );
}
