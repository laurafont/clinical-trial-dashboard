import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { useAuth } from "../context/useAuth";

vi.mock("../context/useAuth");

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("renders username and password fields and submit button", () => {
    renderLoginPage();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows error on bad credentials", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new Error("Invalid credentials"));
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      error: null,
      login,
      logout: vi.fn(),
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), "wrong");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid username or password.",
      );
    });
  });
});
