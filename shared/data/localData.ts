import fs from "node:fs";
import path from "node:path";
import type { IngredientNutritionEntry, Recipe, RecipeSeed } from "../types";
import { calculateRecipeNutrition } from "../lib/nutrition";

function readJsonFile<T>(filename: string): T {
  const fullPath = path.resolve(process.cwd(), "data", filename);
  return JSON.parse(fs.readFileSync(fullPath, "utf8")) as T;
}

export function getNutritionEntries() {
  return readJsonFile<IngredientNutritionEntry[]>("ingredientNutrition.json");
}

export function getRecipeSeeds() {
  return readJsonFile<RecipeSeed[]>("recipes.json");
}

export function getRecipes(): Recipe[] {
  const nutritionEntries = getNutritionEntries();

  return getRecipeSeeds().map((recipe) => ({
    ...recipe,
    nutritionPerServing: calculateRecipeNutrition(recipe, nutritionEntries)
  }));
}
