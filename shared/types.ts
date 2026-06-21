export interface NutritionInfo {
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMilligrams: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  displayMeasure?: string;
  notes?: string;
  pantry?: boolean;
}

export interface RecipeSeed {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
}

export interface Recipe extends RecipeSeed {
  nutritionPerServing: NutritionInfo;
  nutritionUnavailable?: boolean;
  servingsUnavailable?: boolean;
  sourceName?: string;
  sourceUrl?: string;
  timeUnavailable?: boolean;
  videoUrl?: string;
}

export interface IngredientNutritionEntry {
  ingredient: string;
  aliases?: string[];
  gramsPerUnit: Record<string, number>;
  nutritionPer100Grams: NutritionInfo;
}

export interface SearchResult {
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  recipe: Recipe;
}

export interface RecipeSearchRequest {
  ingredients: string[];
}

export interface RecipeSearchResponse {
  results: SearchResult[];
  sourceWarnings?: string[];
}
