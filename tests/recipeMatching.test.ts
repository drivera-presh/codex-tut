import { getRecipes } from "../shared/data/localData";
import { searchRecipes } from "../shared/lib/recipeMatching";

describe("recipe matching", () => {
  const recipes = getRecipes();

  it("puts recipes with no missing essential ingredients first", () => {
    const results = searchRecipes(recipes, [
      "chicken",
      "rice",
      "egg",
      "peas",
      "carrot",
      "scallion",
      "soy sauce"
    ]);

    expect(results[0].recipe.id).toBe("chicken-fried-rice");
    expect(results[0].missingIngredients).toHaveLength(0);
    expect(results[0].matchScore).toBe(100);
  });

  it("allows partial recipes even when a short pantry list leaves several missing ingredients", () => {
    const results = searchRecipes(recipes, ["chicken"]);

    expect(results.map((result) => result.recipe.id)).toContain("chicken-noodle-soup");
    expect(results.map((result) => result.recipe.id)).toContain("chicken-fried-rice");
    expect(results.every((result) => result.matchedIngredients.length > 0)).toBe(true);
  });

  it("still includes recipes with one to three missing ingredients", () => {
    const results = searchRecipes(recipes, ["bread", "cheddar"]);
    const grilledCheese = results.find((result) => result.recipe.id === "grilled-cheese");

    expect(grilledCheese).toBeDefined();
    expect(grilledCheese?.missingIngredients).toHaveLength(0);
  });

  it("returns no recipes when ingredients have no overlap", () => {
    expect(searchRecipes(recipes, ["dragonfruit", "cardamom"])).toHaveLength(0);
  });
});
