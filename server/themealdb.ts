import { normalizeIngredient } from "../shared/lib/ingredientNormalization";
import { scoreRecipe, sortSearchResults } from "../shared/lib/recipeMatching";
import type { NutritionInfo, Recipe, RecipeIngredient, SearchResult } from "../shared/types";

const THEMEALDB_API_KEY = process.env.THEMEALDB_API_KEY ?? "1";
const THEMEALDB_API_ROOT = process.env.THEMEALDB_API_ROOT ?? "https://www.themealdb.com/api/json/v1";
const DEFAULT_MAX_RESULTS = 18;
const parsedMaxResults = Number(process.env.THEMEALDB_MAX_RESULTS ?? DEFAULT_MAX_RESULTS);
const THEMEALDB_MAX_RESULTS =
  Number.isFinite(parsedMaxResults) && parsedMaxResults > 0
    ? Math.floor(parsedMaxResults)
    : DEFAULT_MAX_RESULTS;

const UNAVAILABLE_NUTRITION: NutritionInfo = {
  calories: 0,
  proteinGrams: 0,
  carbohydrateGrams: 0,
  fatGrams: 0,
  fiberGrams: 0,
  sugarGrams: 0,
  sodiumMilligrams: 0
};

const PANTRY_INGREDIENTS = new Set([
  "baking powder",
  "black pepper",
  "butter",
  "flour",
  "oil",
  "olive oil",
  "pepper",
  "salt",
  "sugar",
  "vegetable oil",
  "water"
]);

interface MealDbFilterMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealDbFilterResponse {
  meals: MealDbFilterMeal[] | null;
}

interface MealDbLookupResponse {
  meals: MealDbMeal[] | null;
}

export interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strMealThumb?: string | null;
  strTags?: string | null;
  strYoutube?: string | null;
  strSource?: string | null;
  [key: `strIngredient${number}`]: string | null | undefined;
  [key: `strMeasure${number}`]: string | null | undefined;
}

function buildMealDbUrl(endpoint: string, params?: Record<string, string>) {
  const root = THEMEALDB_API_ROOT.replace(/\/+$/, "");
  const url = new URL(`${root}/${THEMEALDB_API_KEY}/${endpoint}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  return url;
}

async function fetchMealDbJson<T>(endpoint: string, params?: Record<string, string>) {
  const response = await fetch(buildMealDbUrl(endpoint, params), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`TheMealDB request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function getCleanText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function buildIngredientQuery(ingredient: string) {
  return normalizeIngredient(ingredient).replace(/\s+/g, "_");
}

function isPantryIngredient(name: string) {
  return PANTRY_INGREDIENTS.has(normalizeIngredient(name));
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function splitMealDbInstructions(instructions: string | null | undefined) {
  const cleanInstructions = getCleanText(instructions);

  if (!cleanInstructions) {
    return ["Instructions are not listed for this recipe."];
  }

  const lineSteps = cleanInstructions
    .split(/\r?\n/)
    .map((step) => step.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);

  if (lineSteps.length > 1) {
    return lineSteps;
  }

  const sentenceSteps = cleanInstructions
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((step) => step.trim())
    .filter((step) => step.length > 12);

  return sentenceSteps.length > 1 ? sentenceSteps : [cleanInstructions];
}

export function extractMealDbIngredients(meal: MealDbMeal): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];

  for (let index = 1; index <= 20; index += 1) {
    const name = getCleanText(meal[`strIngredient${index}`]);
    const displayMeasure = getCleanText(meal[`strMeasure${index}`]);

    if (!name) {
      continue;
    }

    ingredients.push({
      name,
      quantity: 1,
      unit: "serving",
      displayMeasure,
      pantry: isPantryIngredient(name)
    });
  }

  return ingredients;
}

function buildMealTags(meal: MealDbMeal) {
  return uniqueValues([
    "TheMealDB",
    getCleanText(meal.strCategory),
    getCleanText(meal.strArea),
    ...getCleanText(meal.strTags).split(",")
  ]).slice(0, 6);
}

function buildDescription(meal: MealDbMeal) {
  const category = getCleanText(meal.strCategory);
  const area = getCleanText(meal.strArea);
  const parts = [area, category].filter(Boolean).join(" ");

  return parts
    ? `A ${parts.toLowerCase()} recipe from TheMealDB.`
    : "A recipe from TheMealDB.";
}

export function mapMealDbMealToRecipe(meal: MealDbMeal): Recipe {
  const sourceUrl = getCleanText(meal.strSource);
  const videoUrl = getCleanText(meal.strYoutube);

  return {
    id: `themealdb-${meal.idMeal}`,
    name: getCleanText(meal.strMeal),
    description: buildDescription(meal),
    servings: 0,
    servingsUnavailable: true,
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    timeUnavailable: true,
    ingredients: extractMealDbIngredients(meal),
    instructions: splitMealDbInstructions(meal.strInstructions),
    tags: buildMealTags(meal),
    imageUrl: getCleanText(meal.strMealThumb) || undefined,
    sourceName: "TheMealDB",
    sourceUrl: sourceUrl || videoUrl || undefined,
    videoUrl: videoUrl || undefined,
    nutritionPerServing: UNAVAILABLE_NUTRITION,
    nutritionUnavailable: true
  };
}

async function fetchMealIdsForIngredient(ingredient: string) {
  const response = await fetchMealDbJson<MealDbFilterResponse>("filter.php", {
    i: buildIngredientQuery(ingredient)
  });

  return response.meals ?? [];
}

async function fetchMealById(id: string) {
  const response = await fetchMealDbJson<MealDbLookupResponse>("lookup.php", {
    i: id
  });

  return response.meals?.[0] ?? null;
}

export async function searchMealDbRecipes(ingredients: string[]): Promise<SearchResult[]> {
  const queryIngredients = uniqueValues(
    ingredients
      .map(buildIngredientQuery)
      .map((ingredient) => ingredient.replace(/_/g, " "))
      .filter(Boolean)
  );

  if (queryIngredients.length === 0) {
    return [];
  }

  const mealIdMatches = new Map<string, number>();
  const filterResults = await Promise.all(queryIngredients.map(fetchMealIdsForIngredient));

  for (const meals of filterResults) {
    for (const meal of meals) {
      mealIdMatches.set(meal.idMeal, (mealIdMatches.get(meal.idMeal) ?? 0) + 1);
    }
  }

  const mealIds = [...mealIdMatches.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, THEMEALDB_MAX_RESULTS)
    .map(([mealId]) => mealId);

  const meals = (
    await Promise.all(
      mealIds.map(async (mealId) => {
        try {
          return await fetchMealById(mealId);
        } catch (error) {
          console.warn(`Unable to load TheMealDB meal ${mealId}`, error);
          return null;
        }
      })
    )
  ).filter((meal): meal is MealDbMeal => meal !== null);

  return sortSearchResults(
    meals
      .map((meal) => scoreRecipe(mapMealDbMealToRecipe(meal), ingredients))
      .filter((result) => result.matchedIngredients.length > 0)
  );
}
