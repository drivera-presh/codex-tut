const SYNONYM_GROUPS = [
  ["bell pepper", "capsicum", "sweet pepper"],
  ["green onion", "scallion", "spring onion"],
  ["chicken", "chicken breast", "cooked chicken", "rotisserie chicken"],
  ["rice", "cooked rice", "white rice", "brown rice"],
  ["tomato", "tomatoes", "cherry tomato", "canned tomato", "tomato sauce"],
  ["onion", "yellow onion", "red onion", "white onion"],
  ["bean", "beans", "black bean", "black beans", "pinto bean", "pinto beans"],
  ["tortilla", "tortillas", "corn tortilla", "flour tortilla"],
  ["cheese", "cheddar", "cheddar cheese", "shredded cheese"],
  ["bread", "sandwich bread", "whole wheat bread", "sourdough"],
  ["egg", "eggs"],
  ["potato", "potatoes", "russet potato", "baking potato"],
  ["tuna", "canned tuna"],
  ["pasta", "spaghetti", "penne", "noodle", "noodles"],
  ["lentil", "lentils", "brown lentil", "green lentil"],
  ["milk", "almond milk", "oat milk", "dairy milk"],
  ["berries", "berry", "blueberry", "blueberries", "strawberry", "strawberries"],
  ["broccoli", "broccoli florets"],
  ["snap peas", "snow peas", "sugar snap peas"],
  ["olive oil", "oil", "vegetable oil"],
  ["soy sauce", "tamari"],
  ["garlic", "garlic clove", "garlic cloves"],
  ["ginger", "fresh ginger"],
  ["mayonnaise", "mayo"],
  ["yogurt", "greek yogurt"],
  ["banana", "bananas"]
];

const ALIAS_TO_CANONICAL = new Map<string, string>();

for (const group of SYNONYM_GROUPS) {
  const canonical = group[0];
  for (const item of group) {
    ALIAS_TO_CANONICAL.set(item, canonical);
  }
}

function singularizeWord(word: string) {
  if (word === "tomatoes") {
    return "tomato";
  }

  if (word === "potatoes") {
    return "potato";
  }

  if (word.endsWith("ies") && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith("oes") && word.length > 4) {
    return word.slice(0, -2);
  }

  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
}

export function normalizeIngredient(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeWord)
    .join(" ");
}

export function canonicalizeIngredient(input: string) {
  const normalized = normalizeIngredient(input);
  return ALIAS_TO_CANONICAL.get(normalized) ?? normalized;
}

export function normalizeIngredientList(ingredients: string[]) {
  return ingredients.map(canonicalizeIngredient).filter(Boolean);
}
