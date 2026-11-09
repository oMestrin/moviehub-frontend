// Gera um único pacote para o Azure Static Web Apps:
//   dist/                 shell (host)
//   dist/mfe-catalogo/    remote "catalogo"
//   dist/mfe-avaliacoes/  remote "avaliacoes"
// Variáveis lidas do .env na raiz (ou do ambiente do CI): VITE_BFF_URL, VITE_APIM_SUBSCRIPTION_KEY.
import { spawnSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";

const run = (workspace) => {
  console.log(`\n> build ${workspace}`);
  const result = spawnSync("npm", ["run", "build", "-w", workspace], { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

rmSync("dist", { recursive: true, force: true });
run("apps/mfe-catalogo");
run("apps/mfe-avaliacoes");
run("apps/shell");

cpSync("apps/shell/dist", "dist", { recursive: true });
cpSync("apps/mfe-catalogo/dist", "dist/mfe-catalogo", { recursive: true });
cpSync("apps/mfe-avaliacoes/dist", "dist/mfe-avaliacoes", { recursive: true });
console.log("\nPacote pronto em dist/");
