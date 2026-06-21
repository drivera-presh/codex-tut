import { Loader2, Sparkles, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { IngredientForm } from "./components/IngredientForm";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailModal } from "./components/RecipeDetailModal";
import { getLocalRecipes } from "./data/localRecipes";
import { searchRecipes } from "../shared/lib/recipeMatching";
import type { SearchResult } from "../shared/types";

type SearchStatus = "idle" | "loading" | "success" | "error";

function parseIngredientText(value: string) {
  return value
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}

export default function App() {
  const [ingredientText, setIngredientText] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const ingredientCount = useMemo(() => parseIngredientText(ingredientText).length, [ingredientText]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ingredients = parseIngredientText(ingredientText);

    if (ingredients.length === 0) {
      setStatus("idle");
      setResults([]);
      setMessage("Add at least one ingredient to search.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const searchResults = searchRecipes(getLocalRecipes(), ingredients);
      setResults(searchResults);
      setStatus("success");
      setMessage(
        searchResults.length === 0
          ? "No close matches yet. Try rice, egg, tomato, beans, chicken, pasta, or potato."
          : ""
      );
    } catch (error) {
      setStatus("error");
      setResults([]);
      setMessage("The recipe search is not available right now. Please try again.");
    }
  }

  function handleClear() {
    setIngredientText("");
    setStatus("idle");
    setMessage("");
    setResults([]);
    setSelectedResult(null);
  }

  const hasResults = status === "success" && results.length > 0;

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="app-title">
        <div className="intro">
          <div className="brand-mark" aria-hidden="true">
            <Utensils size={26} />
          </div>
          <div>
            <p className="eyebrow">Ingredient Recipe Finder</p>
            <h1 id="app-title">Cook from what you have</h1>
          </div>
        </div>

        <IngredientForm
          value={ingredientText}
          ingredientCount={ingredientCount}
          errorMessage={message && status !== "success" ? message : ""}
          isLoading={status === "loading"}
          onChange={setIngredientText}
          onClear={handleClear}
          onSubmit={handleSearch}
        />

        <section className="results-area" aria-live="polite" aria-busy={status === "loading"}>
          {status === "loading" && (
            <div className="state-panel">
              <Loader2 className="spin" size={28} aria-hidden="true" />
              <h2>Finding your best matches</h2>
              <p>Checking ingredients, missing items, prep time, and nutrition estimates.</p>
            </div>
          )}

          {status !== "loading" && !hasResults && (
            <div className="state-panel">
              <Sparkles size={28} aria-hidden="true" />
              <h2>{status === "success" ? "No close matches" : "Ready when you are"}</h2>
              <p>
                {message ||
                  "Try a short pantry list like chicken, rice, tomato, onion or egg, spinach, cheese."}
              </p>
            </div>
          )}

          {hasResults && (
            <div className="results-header">
              <div>
                <p className="eyebrow">{results.length} recipe matches</p>
                <h2>Best matches first</h2>
              </div>
              <p className="estimate-note">Nutrition values are estimates per serving.</p>
            </div>
          )}

          {hasResults && (
            <div className="recipe-grid">
              {results.map((result) => (
                <RecipeCard
                  key={result.recipe.id}
                  result={result}
                  onViewDetails={() => setSelectedResult(result)}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {selectedResult && (
        <RecipeDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}
    </main>
  );
}
