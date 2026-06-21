import { Check, Clock3, ExternalLink, X } from "lucide-react";
import { useEffect, useId } from "react";
import type { RecipeIngredient, SearchResult } from "../../shared/types";
import { NutritionFacts } from "./NutritionFacts";

interface RecipeDetailModalProps {
  result: SearchResult;
  onClose: () => void;
}

function formatIngredient(ingredient: RecipeIngredient) {
  const measure = ingredient.displayMeasure ?? `${ingredient.quantity} ${ingredient.unit}`;
  const ingredientText = [measure.trim(), ingredient.name].filter(Boolean).join(" ");

  return `${ingredientText}${ingredient.notes ? `, ${ingredient.notes}` : ""}`;
}

export function RecipeDetailModal({ result, onClose }: RecipeDetailModalProps) {
  const titleId = useId();
  const { recipe, matchedIngredients, missingIngredients } = result;
  const servingsLabel = recipe.servingsUnavailable ? "Servings not listed" : `${recipe.servings} servings`;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function getIngredientStatus(ingredient: RecipeIngredient) {
    if (ingredient.pantry) {
      return "Pantry";
    }

    if (matchedIngredients.includes(ingredient.name)) {
      return "Have";
    }

    return "Missing";
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{result.matchScore}% ingredient match</p>
            <h2 id={titleId}>{recipe.name}</h2>
            <p>{recipe.description}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close recipe details" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {recipe.imageUrl && <img className="modal-recipe-image" src={recipe.imageUrl} alt={recipe.name} />}

        <div className="modal-meta">
          {recipe.timeUnavailable ? (
            <span>
              <Clock3 size={16} aria-hidden="true" />
              Time not listed
            </span>
          ) : (
            <>
              <span>
                <Clock3 size={16} aria-hidden="true" />
                Prep {recipe.prepTimeMinutes} min
              </span>
              <span>
                <Clock3 size={16} aria-hidden="true" />
                Cook {recipe.cookTimeMinutes} min
              </span>
            </>
          )}
          <span>{servingsLabel}</span>
          {recipe.sourceUrl && (
            <a className="source-link" href={recipe.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              Source
            </a>
          )}
        </div>

        <div className="modal-layout">
          <section className="detail-section" aria-labelledby="ingredients-title">
            <h3 id="ingredients-title">Ingredients</h3>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ingredient) => {
                const status = getIngredientStatus(ingredient);
                return (
                  <li key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}>
                    <span>{formatIngredient(ingredient)}</span>
                    <span className={`ingredient-status ${status.toLowerCase()}`}>
                      {status === "Have" && <Check size={14} aria-hidden="true" />}
                      {status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="details-stack">
            <section className="detail-section" aria-labelledby="matched-title">
              <h3 id="matched-title">Already Have</h3>
              <p>{matchedIngredients.length ? matchedIngredients.join(", ") : "No essential matches yet."}</p>
            </section>
            <section className="detail-section" aria-labelledby="missing-title">
              <h3 id="missing-title">Missing Ingredients</h3>
              <p>{missingIngredients.length ? missingIngredients.join(", ") : "No essential ingredients missing."}</p>
            </section>
            {recipe.nutritionUnavailable ? (
              <section className="nutrition-panel nutrition-unavailable" aria-labelledby="nutrition-title">
                <div>
                  <h3 id="nutrition-title">Nutrition Facts</h3>
                  <p>Not provided by {recipe.sourceName ?? "this recipe source"}.</p>
                </div>
              </section>
            ) : (
              <NutritionFacts nutrition={recipe.nutritionPerServing} />
            )}
          </div>
        </div>

        <section className="detail-section instructions" aria-labelledby="instructions-title">
          <h3 id="instructions-title">Instructions</h3>
          <ol>
            {recipe.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </section>
    </div>
  );
}
