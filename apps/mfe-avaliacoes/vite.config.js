import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// MFE Avaliações — remote "avaliacoes". Em build, é servido em /mfe-avaliacoes/ dentro do Static Web App.
export default defineConfig(({ command }) => ({
  base: command === "build" ? (process.env.MFE_AVALIACOES_BASE ?? "/mfe-avaliacoes/") : "http://localhost:5175/",
  envDir: "../..",
  plugins: [
    react(),
    federation({
      name: "avaliacoes",
      filename: "remoteEntry.js",
      exposes: {
        "./MovieReviews": "./src/MovieReviews.jsx",
        "./RecentReviews": "./src/RecentReviews.jsx"
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
      dts: false
    })
  ],
  server: { port: 5175, strictPort: true, origin: "http://localhost:5175", cors: true },
  preview: { port: 5175, strictPort: true, cors: true },
  build: { target: "chrome89" }
}));
