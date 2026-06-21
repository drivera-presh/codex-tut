import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import App from "./App";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("falls back to local recipe results with images when the API is unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    fireEvent.change(screen.getByLabelText(/ingredients/i), {
      target: { value: "chicken, rice, egg" }
    });
    fireEvent.click(screen.getByRole("button", { name: /find recipes/i }));

    const recipeImage = await screen.findByRole("img", { name: "Chicken Fried Rice" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Chicken Fried Rice")).toBeInTheDocument();
    expect(recipeImage).toHaveAttribute("src", expect.stringContaining("wuyd2h1765655837.jpg"));
  });
});
