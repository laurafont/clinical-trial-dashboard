import { Link, useLocation } from "react-router-dom";

import { ROUTES } from "../../constants/routes";
import { Button } from "../ui/button";
import { useAuth } from "../../context/useAuth";

export function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4 px-4">
        <Link
          to={ROUTES.PARTICIPANTS}
          className="flex items-center gap-2 font-semibold text-foreground no-underline"
        >
          Clinical Trial Dashboard
        </Link>
        <nav className="flex flex-1 items-center gap-2">
          <Link to={ROUTES.PARTICIPANTS}>
            <Button
              variant={
                location.pathname === ROUTES.PARTICIPANTS
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
            >
              Participants
            </Button>
          </Link>
          <Link to={ROUTES.DASHBOARD}>
            <Button
              variant={
                location.pathname === ROUTES.DASHBOARD ? "secondary" : "ghost"
              }
              size="sm"
            >
              Dashboard
            </Button>
          </Link>
        </nav>
        <Button variant="outline" size="sm" onClick={() => void logout()}>
          Logout
        </Button>
      </div>
    </header>
  );
}
