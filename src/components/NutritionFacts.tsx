import type { NutritionInfo } from "../../shared/types";

interface NutritionFactsProps {
  nutrition: NutritionInfo;
}

const nutritionRows = [
  ["Calories", "calories"],
  ["Protein", "proteinGrams"],
  ["Carbohydrates", "carbohydrateGrams"],
  ["Fat", "fatGrams"],
  ["Fiber", "fiberGrams"],
  ["Sugar", "sugarGrams"],
  ["Sodium", "sodiumMilligrams"]
] as const;

function formatNutritionValue(key: keyof NutritionInfo, value: number) {
  if (key === "calories") {
    return `${value}`;
  }

  if (key === "sodiumMilligrams") {
    return `${value} mg`;
  }

  return `${value} g`;
}

export function NutritionFacts({ nutrition }: NutritionFactsProps) {
  return (
    <section className="nutrition-panel" aria-labelledby="nutrition-title">
      <div>
        <h3 id="nutrition-title">Nutrition Facts</h3>
        <p>Estimated per serving</p>
      </div>
      <dl>
        {nutritionRows.map(([label, key]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{formatNutritionValue(key, nutrition[key])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
