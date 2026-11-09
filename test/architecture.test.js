// Regras de arquitetura do microfrontend (node:test, lendo o código-fonte).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const APPS = ["shell", "mfe-catalogo", "mfe-avaliacoes"];
const REMOTES = { catalogo: "mfe-catalogo", avaliacoes: "mfe-avaliacoes" };

function sources(app) {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : /\.(js|jsx)$/.test(entry.name) ? [path] : [];
    });
  return walk(join("apps", app, "src")).map((path) => ({ path, rel: relative(join("apps", app), path), code: readFileSync(path, "utf8") }));
}

const imports = (code) => [...code.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g)].map((m) => m[1]);

describe("isolamento entre microfrontends", () => {
  for (const app of APPS) {
    test(`${app} não importa código de outro app`, () => {
      for (const file of sources(app)) {
        for (const spec of imports(file.code)) {
          assert.ok(!/(^|\/)\.\.\/\.\.\/|apps\/|mfe-(catalogo|avaliacoes)\//.test(spec), `${file.rel} importa ${spec}`);
        }
      }
    });
  }

  test("o shell só usa os remotes pelos nomes federados", () => {
    const remoteImports = sources("shell").flatMap((file) => imports(file.code)).filter((spec) => /^(catalogo|avaliacoes)\//.test(spec));
    assert.ok(remoteImports.length >= 6, "o shell deveria carregar os componentes dos remotes");
  });

  test("todo módulo exposto pelos remotes existe", () => {
    for (const app of Object.values(REMOTES)) {
      const config = readFileSync(join("apps", app, "vite.config.js"), "utf8");
      const exposed = [...config.matchAll(/"\.\/\w+":\s*"([^"]+)"/g)].map((m) => m[1]);
      assert.ok(exposed.length > 0, `${app} não expõe nada`);
      for (const file of exposed) assert.ok(existsSync(join("apps", app, file)), `${app}: ${file} não existe`);
    }
  });

  test("os componentes que o shell carrega estão expostos", () => {
    const shell = sources("shell").map((f) => f.code).join("\n");
    for (const [remote, app] of Object.entries(REMOTES)) {
      const config = readFileSync(join("apps", app, "vite.config.js"), "utf8");
      for (const [, name] of shell.matchAll(new RegExp(`import\\("${remote}/(\\w+)"\\)`, "g"))) {
        assert.match(config, new RegExp(`"\\./${name}"`), `${remote}/${name} não está exposto`);
      }
    }
  });
});

describe("o frontend só conversa com o BFF", () => {
  for (const app of Object.values(REMOTES)) {
    test(`${app}: chamadas HTTP só no cliente do BFF`, () => {
      for (const file of sources(app)) {
        if (file.rel === join("src", "api", "bff.js")) continue;
        assert.ok(!/\bfetch\(|XMLHttpRequest|axios/.test(file.code), `${file.rel} faz chamada HTTP fora de src/api/bff.js`);
      }
    });

    test(`${app}: o cliente usa só VITE_BFF_URL e a chave do API Management`, () => {
      const client = readFileSync(join("apps", app, "src", "api", "bff.js"), "utf8");
      assert.match(client, /import\.meta\.env\.VITE_BFF_URL/);
      assert.match(client, /Ocp-Apim-Subscription-Key/);
      const urls = [...client.matchAll(/https?:\/\/[^\s"'`]+/g)].map((m) => m[0]);
      assert.deepEqual(urls, ["http://localhost:3000"], "o único endereço fixo deve ser o BFF local");
    });
  }

  test("o shell não chama APIs", () => {
    for (const file of sources("shell")) assert.ok(!/\bfetch\(/.test(file.code), `${file.rel} chama fetch`);
  });
});

describe("comunicação por eventos", () => {
  test("os dois MFEs usam os mesmos nomes de evento", () => {
    const names = (app) => readFileSync(join("apps", app, "src", "events.js"), "utf8").match(/"moviehub:[\w-]+"/g).sort();
    assert.deepEqual(names("mfe-catalogo"), names("mfe-avaliacoes"));
  });
});
