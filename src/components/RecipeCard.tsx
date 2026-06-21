import { Clock3, Flame, ListPlus } from "lucide-react";
import type { SearchResult } from "../../shared/types";

interface RecipeCardProps {
  result: SearchResult;
  onViewDetails: () => void;
}

function formatTime(prepTimeMinutes: number, cookTimeMinutes: number) {
  const total = prepTimeMinutes + cookTimeMinutes;
  return `${total} min`;
}

export function RecipeCard({ result, onViewDetails }: RecipeCardProps) {
  const { recipe, matchScore, missingIngredients } = result;

  return (
    <article className="recipe-card">
      <div className="card-topline">
        <span className="match-pill">{matchScore}% match</span>
        <span>{recipe.servings} servings</span>
      </div>
      <h3>{recipe.name}</h3>
      <p>{recipe.description}</p>
      <div className="stat-row" aria-label={`${recipe.name} summary`}>
        <span>
          <Flame size={16} aria-hidden="true" />
          {recipe.nutritionPerServing.calories} cal
        </span>
        <span>
          <Clock3 size={16} aria-hidden="true" />
          {formatTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}
        </span>
      </div>
      <div className="missing-box">
        <div>
          <ListPlus size={17} aria-hidden="true" />
          <strong>Missing</strong>
        </div>
        <p>{missingIngredients.length === 0 ? "Nothing essential" : missingIngredients.join(", ")}</p>
      </div>
      <div className="tag-row" aria-label="Diet tags">
        {recipe.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <button type="button" className="secondary-button" onClick={onViewDetails}>
        View full recipe
      </button>
    </article>
  );
}
