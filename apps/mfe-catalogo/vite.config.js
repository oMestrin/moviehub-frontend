import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// MFE Catálogo — remote "catalogo". Em build, é servido em /mfe-catalogo/ dentro do Static Web App.
export default defineConfig(({ command }) => ({
  base: command === "build" ? (process.env.MFE_CATALOGO_BASE ?? "/mfe-catalogo/") : "http://localhost:5174/",
  envDir: "../..",
  plugins: [
    react(),
    federation({
      name: "catalogo",
      filename: "remoteEntry.js",
      exposes: {
        "./Highlights": "./src/Highlights.jsx",
        "./Catalog": "./src/Catalog.jsx",
        "./MovieDetails": "./src/MovieDetails.jsx",
        "./MovieForm": "./src/MovieForm.jsx"
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
      dts: false
    })
  ],
  server: { port: 5174, strictPort: true, origin: "http://localhost:5174", cors: true },
  preview: { port: 5174, strictPort: true, cors: true },
  build: { target: "chrome89" }
}));
