import type {
  IngredientNutritionEntry,
  NutritionInfo,
  RecipeIngredient,
  RecipeSeed
} from "../types";
import { canonicalizeIngredient } from "./ingredientNormalization";

const DEFAULT_GRAMS_PER_UNIT: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.59,
  pound: 453.59,
  pounds: 453.59
};

const ZERO_NUTRITION: NutritionInfo = {
  calories: 0,
  proteinGrams: 0,
  carbohydrateGrams: 0,
  fatGrams: 0,
  fiberGrams: 0,
  sugarGrams: 0,
  sodiumMilligrams: 0
};

function normalizeUnit(unit: string) {
  return unit.trim().toLowerCase();
}

function roundNutrition(nutrition: NutritionInfo): NutritionInfo {
  return {
    calories: Math.round(nutrition.calories),
    proteinGrams: Math.round(nutrition.proteinGrams * 10) / 10,
    carbohydrateGrams: Math.round(nutrition.carbohydrateGrams * 10) / 10,
    fatGrams: Math.round(nutrition.fatGrams * 10) / 10,
    fiberGrams: Math.round(nutrition.fiberGrams * 10) / 10,
    sugarGrams: Math.round(nutrition.sugarGrams * 10) / 10,
    sodiumMilligrams: Math.round(nutrition.sodiumMilligrams)
  };
}

function addNutrition(a: NutritionInfo, b: NutritionInfo): NutritionInfo {
  return {
    calories: a.calories + b.calories,
    proteinGrams: a.proteinGrams + b.proteinGrams,
    carbohydrateGrams: a.carbohydrateGrams + b.carbohydrateGrams,
    fatGrams: a.fatGrams + b.fatGrams,
    fiberGrams: a.fiberGrams + b.fiberGrams,
    sugarGrams: a.sugarGrams + b.sugarGrams,
    sodiumMilligrams: a.sodiumMilligrams + b.sodiumMilligrams
  };
}

function scaleNutrition(nutrition: NutritionInfo, factor: number): NutritionInfo {
  return {
    calories: nutrition.calories * factor,
    proteinGrams: nutrition.proteinGrams * factor,
    carbohydrateGrams: nutrition.carbohydrateGrams * factor,
    fatGrams: nutrition.fatGrams * factor,
    fiberGrams: nutrition.fiberGrams * factor,
    sugarGrams: nutrition.sugarGrams * factor,
    sodiumMilligrams: nutrition.sodiumMilligrams * factor
  };
}

function buildNutritionIndex(entries: IngredientNutritionEntry[]) {
  const index = new Map<string, IngredientNutritionEntry>();

  for (const entry of entries) {
    index.set(canonicalizeIngredient(entry.ingredient), entry);

    for (const alias of entry.aliases ?? []) {
      index.set(canonicalizeIngredient(alias), entry);
    }
  }

  return index;
}

export function getGramsForIngredient(
  ingredient: RecipeIngredient,
  entry: IngredientNutritionEntry
) {
  const unit = normalizeUnit(ingredient.unit);
  const gramsPerUnit = entry.gramsPerUnit[unit] ?? DEFAULT_GRAMS_PER_UNIT[unit];

  if (!gramsPerUnit) {
    throw new Error(`No gram conversion configured for ${ingredient.name} (${ingredient.unit})`);
  }

  return ingredient.quantity * gramsPerUnit;
}

export function calculateRecipeNutrition(
  recipe: RecipeSeed,
  nutritionEntries: IngredientNutritionEntry[]
) {
  const nutritionIndex = buildNutritionIndex(nutritionEntries);
  const totalNutrition = recipe.ingredients.reduce<NutritionInfo>((total, ingredient) => {
    const entry = nutritionIndex.get(canonicalizeIngredient(ingredient.name));

    if (!entry) {
      throw new Error(`No nutrition data configured for ${ingredient.name}`);
    }

    const grams = getGramsForIngredient(ingredient, entry);

    // Ingredient nutrition is stored per 100 grams. The contribution for each
    // ingredient is (grams used / 100) * its per-100g nutrition, and the summed
    // recipe total is divided by servings to estimate one serving.
    const contribution = scaleNutrition(entry.nutritionPer100Grams, grams / 100);
    return addNutrition(total, contribution);
  }, ZERO_NUTRITION);

  return roundNutrition(scaleNutrition(totalNutrition, 1 / recipe.servings));
}
