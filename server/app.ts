import cors from "cors";
import express from "express";
import path from "node:path";
import { getRecipes } from "../shared/data/localData";
import { searchRecipes } from "../shared/lib/recipeMatching";
import type { RecipeSearchRequest } from "../shared/types";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/recipes", (_request, response, next) => {
    try {
      response.json({ recipes: getRecipes() });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/recipes/search", (request, response, next) => {
    try {
      const body = request.body as Partial<RecipeSearchRequest>;

      if (!Array.isArray(body.ingredients)) {
        response.status(400).json({ error: "Request body must include an ingredients array." });
        return;
      }

      const ingredients = body.ingredients
        .filter((ingredient): ingredient is string => typeof ingredient === "string")
        .map((ingredient) => ingredient.trim())
        .filter(Boolean);

      response.json({ results: searchRecipes(getRecipes(), ingredients) });
    } catch (error) {
      next(error);
    }
  });

  const clientDistPath = path.resolve(process.cwd(), "dist", "client");

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(clientDistPath));
    app.get("*", (_request, response) => {
      response.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(
    (
      error: Error,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(error);
      response.status(500).json({ error: "Something went wrong while processing the recipe request." });
    }
  );

  return app;
}
