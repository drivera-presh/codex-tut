import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { IngredientForm } from "./IngredientForm";

describe("IngredientForm", () => {
  it("submits the form and shows validation feedback", () => {
    const onSubmit = vi.fn((event) => event.preventDefault());

    render(
      <IngredientForm
        value=""
        ingredientCount={0}
        errorMessage="Add at least one ingredient to search."
        isLoading={false}
        onChange={vi.fn()}
        onClear={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.submit(screen.getByRole("form", { name: /ingredient recipe search/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Add at least one ingredient");
  });

  it("clears ingredients when requested", () => {
    const onClear = vi.fn();

    render(
      <IngredientForm
        value="rice, egg"
        ingredientCount={2}
        errorMessage=""
        isLoading={false}
        onChange={vi.fn()}
        onClear={onClear}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
