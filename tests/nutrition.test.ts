import type { RecipeSeed } from "../shared/types";
import { getNutritionEntries, getRecipes } from "../shared/data/localData";
import { calculateRecipeNutrition } from "../shared/lib/nutrition";

describe("nutrition helpers", () => {
  it("calculates per-serving nutrition from ingredient quantities", () => {
    const recipe: RecipeSeed = {
      id: "single-rice",
      name: "Single Rice",
      description: "Test recipe",
      servings: 1,
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      ingredients: [{ name: "cooked rice", quantity: 100, unit: "gram" }],
      instructions: ["Serve rice."],
      tags: []
    };

    const nutrition = calculateRecipeNutrition(recipe, getNutritionEntries());

    expect(nutrition.calories).toBe(130);
    expect(nutrition.carbohydrateGrams).toBe(28.2);
  });

  it("hydrates every starter recipe with estimated nutrition", () => {
    const recipes = getRecipes();

    expect(recipes).toHaveLength(12);
    for (const recipe of recipes) {
      expect(recipe.nutritionPerServing.calories).toBeGreaterThan(0);
      expect(recipe.nutritionPerServing.proteinGrams).toBeGreaterThanOrEqual(0);
      expect(recipe.nutritionPerServing.sodiumMilligrams).toBeGreaterThanOrEqual(0);
    }
  });
});
