import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Shell (host). Carrega os remotes em tempo de execução pelo remoteEntry.js de cada um.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, "../..", "VITE_");
  const build = command === "build";
  const remote = (name, url) => ({ type: "module", name, entry: url, entryGlobalName: name, shareScope: "default" });

  return {
    envDir: "../..",
    plugins: [
      react(),
      federation({
        name: "shell",
        remotes: {
          catalogo: remote("catalogo", env.VITE_REMOTE_CATALOGO_URL || (build ? "/mfe-catalogo/remoteEntry.js" : "http://localhost:5174/remoteEntry.js")),
          avaliacoes: remote("avaliacoes", env.VITE_REMOTE_AVALIACOES_URL || (build ? "/mfe-avaliacoes/remoteEntry.js" : "http://localhost:5175/remoteEntry.js"))
        },
        shared: { react: { singleton: true }, "react-dom": { singleton: true } },
        dts: false
      })
    ],
    server: { port: 5173, strictPort: true },
    preview: { port: 5173, strictPort: true },
    build: { target: "chrome89" }
  };
});
