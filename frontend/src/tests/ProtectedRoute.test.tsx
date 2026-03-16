import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { useAuth } from "../context/useAuth";

vi.mock("../context/useAuth");

function renderProtectedRoute(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<div data-testid="protected-outlet">Protected content</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("redirects to login when not authenticated", () => {
    renderProtectedRoute("/");

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-outlet")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute("/");

    expect(screen.getByTestId("protected-outlet")).toHaveTextContent("Protected content");
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});
