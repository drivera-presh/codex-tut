import { Search, X } from "lucide-react";
import type { FormEvent } from "react";

interface IngredientFormProps {
  value: string;
  ingredientCount: number;
  errorMessage: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function IngredientForm({
  value,
  ingredientCount,
  errorMessage,
  isLoading,
  onChange,
  onClear,
  onSubmit
}: IngredientFormProps) {
  return (
    <form className="search-panel" aria-label="Ingredient recipe search" onSubmit={onSubmit}>
      <div className="field-row">
        <label htmlFor="ingredients">Ingredients</label>
        <span>{ingredientCount} added</span>
      </div>
      <textarea
        id="ingredients"
        value={value}
        rows={4}
        placeholder="chicken, rice, tomato, onion"
        aria-describedby={errorMessage ? "ingredient-error" : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {errorMessage && (
        <p className="field-error" id="ingredient-error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="button-row">
        <button className="primary-button" type="submit" disabled={isLoading}>
          <Search size={18} aria-hidden="true" />
          <span>{isLoading ? "Searching" : "Find Recipes"}</span>
        </button>
        <button className="ghost-button" type="button" onClick={onClear} disabled={!value && !errorMessage}>
          <X size={18} aria-hidden="true" />
          <span>Clear</span>
        </button>
      </div>
    </form>
  );
}
