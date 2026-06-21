import { canonicalizeIngredient, normalizeIngredient } from "../shared/lib/ingredientNormalization";

describe("ingredient normalization", () => {
  it("trims whitespace, ignores case, and removes punctuation", () => {
    expect(normalizeIngredient("  Chicken Breast!! ")).toBe("chicken breast");
  });

  it("maps common synonyms to a canonical ingredient", () => {
    expect(canonicalizeIngredient("capsicum")).toBe("bell pepper");
    expect(canonicalizeIngredient("Scallions")).toBe("green onion");
    expect(canonicalizeIngredient("cooked rice")).toBe("rice");
  });

  it("normalizes simple plurals", () => {
    expect(canonicalizeIngredient("tomatoes")).toBe("tomato");
    expect(canonicalizeIngredient("potatoes")).toBe("potato");
  });
});
