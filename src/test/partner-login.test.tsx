import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnerLogin } from "@/components/partner-login";

describe("Hospital / Provider Login", () => {
  it("shows the requested frontend-only controls and toggles password visibility", () => {
    render(<PartnerLogin />);

    expect(screen.getByLabelText("Hospital / Provider ID")).toBeVisible();
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    expect(screen.getByText("Forgot Password?")).toBeVisible();
    expect(screen.getByRole("button", { name: "Login" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });
});
