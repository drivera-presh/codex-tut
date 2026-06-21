import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubRepositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.GITHUB_PAGES === "true" && githubRepositoryName
  ? `/${githubRepositoryName}/`
  : "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: false
  }
});
