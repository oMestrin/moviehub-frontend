// Sobe os três apps em modo desenvolvimento:
//   shell 5173, mfe-catalogo 5174, mfe-avaliacoes 5175
import { spawn } from "node:child_process";

const apps = ["apps/mfe-catalogo", "apps/mfe-avaliacoes", "apps/shell"];
const children = apps.map((workspace) => spawn("npm", ["run", "dev", "-w", workspace], { stdio: "inherit", shell: process.platform === "win32" }));
const stop = () => children.forEach((child) => child.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
