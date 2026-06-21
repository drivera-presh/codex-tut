import type { Recipe, SearchResult } from "../types";
import { canonicalizeIngredient, normalizeIngredientList } from "./ingredientNormalization";

function getRequiredIngredients(recipe: Recipe) {
  return recipe.ingredients.filter((ingredient) => !ingredient.pantry);
}

export function scoreRecipe(recipe: Recipe, userIngredients: string[]): SearchResult {
  const available = new Set(normalizeIngredientList(userIngredients));
  const matchedIngredients: string[] = [];
  const missingIngredients: string[] = [];

  for (const ingredient of getRequiredIngredients(recipe)) {
    const canonicalName = canonicalizeIngredient(ingredient.name);

    if (available.has(canonicalName)) {
      matchedIngredients.push(ingredient.name);
    } else {
      missingIngredients.push(ingredient.name);
    }
  }

  const requiredCount = matchedIngredients.length + missingIngredients.length;
  const matchScore = requiredCount === 0 ? 100 : Math.round((matchedIngredients.length / requiredCount) * 100);

  return {
    matchScore,
    matchedIngredients,
    missingIngredients,
    recipe
  };
}

export function sortSearchResults(results: SearchResult[]) {
  return [...results].sort((a, b) => {
    if (a.missingIngredients.length !== b.missingIngredients.length) {
      return a.missingIngredients.length - b.missingIngredients.length;
    }

    if (a.matchScore !== b.matchScore) {
      return b.matchScore - a.matchScore;
    }

    const aTotalTime = a.recipe.prepTimeMinutes + a.recipe.cookTimeMinutes;
    const bTotalTime = b.recipe.prepTimeMinutes + b.recipe.cookTimeMinutes;
    return aTotalTime - bTotalTime;
  });
}

export function searchRecipes(recipes: Recipe[], userIngredients: string[]) {
  const normalizedUserIngredients = normalizeIngredientList(userIngredients);

  if (normalizedUserIngredients.length === 0) {
    return [];
  }

  return sortSearchResults(recipes
    .map((recipe) => scoreRecipe(recipe, normalizedUserIngredients))
    .filter((result) => result.matchedIngredients.length > 0));
}
