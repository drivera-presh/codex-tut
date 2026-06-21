import { extractMealDbIngredients, mapMealDbMealToRecipe, type MealDbMeal } from "../server/themealdb";

const meal = {
  idMeal: "12345",
  strMeal: "Test Curry",
  strCategory: "Chicken",
  strArea: "Indian",
  strInstructions: "Cook the chicken.\r\nServe with rice.",
  strMealThumb: "https://example.com/test-curry.jpg",
  strTags: "Spicy,Curry",
  strYoutube: "https://example.com/video",
  strSource: "https://example.com/source",
  strIngredient1: "Chicken",
  strMeasure1: "2 pieces",
  strIngredient2: "Salt",
  strMeasure2: "1 tsp",
  strIngredient3: "",
  strMeasure3: ""
} satisfies MealDbMeal;

describe("TheMealDB mapping", () => {
  it("preserves API measures and marks pantry ingredients", () => {
    const ingredients = extractMealDbIngredients(meal);

    expect(ingredients).toHaveLength(2);
    expect(ingredients[0]).toMatchObject({
      name: "Chicken",
      displayMeasure: "2 pieces",
      pantry: false
    });
    expect(ingredients[1]).toMatchObject({
      name: "Salt",
      displayMeasure: "1 tsp",
      pantry: true
    });
  });

  it("maps TheMealDB meals into app recipes", () => {
    const recipe = mapMealDbMealToRecipe(meal);

    expect(recipe.id).toBe("themealdb-12345");
    expect(recipe.imageUrl).toBe("https://example.com/test-curry.jpg");
    expect(recipe.sourceName).toBe("TheMealDB");
    expect(recipe.sourceUrl).toBe("https://example.com/source");
    expect(recipe.nutritionUnavailable).toBe(true);
    expect(recipe.timeUnavailable).toBe(true);
    expect(recipe.servingsUnavailable).toBe(true);
    expect(recipe.instructions).toEqual(["Cook the chicken.", "Serve with rice."]);
    expect(recipe.tags).toEqual(["TheMealDB", "Chicken", "Indian", "Spicy", "Curry"]);
  });
});
