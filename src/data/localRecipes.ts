import ingredientNutritionData from "../../data/ingredientNutrition.json";
import recipeSeedData from "../../data/recipes.json";
import { calculateRecipeNutrition } from "../../shared/lib/nutrition";
import type { IngredientNutritionEntry, Recipe, RecipeSeed } from "../../shared/types";

const nutritionEntries = ingredientNutritionData as IngredientNutritionEntry[];
const recipeSeeds = recipeSeedData as RecipeSeed[];

export function getLocalRecipes(): Recipe[] {
  return recipeSeeds.map((recipe) => ({
    ...recipe,
    nutritionPerServing: calculateRecipeNutrition(recipe, nutritionEntries)
  }));
}
