# MovieHub — Microfrontend

Frontend do MovieHub em **React** com **Module Federation**: um shell (host) carrega, em tempo de execução, dois microfrontends independentes. O frontend fala **apenas com o BFF**, sempre pelo **Azure API Management**.

| App | Porta local | Expõe | Responsabilidade |
|---|---|---|---|
| `apps/shell` | 5173 | — | Layout, navegação, rotas, tokens de design e isolamento de falhas de cada remote |
| `apps/mfe-catalogo` | 5174 | `Highlights`, `Catalog`, `MovieDetails`, `MovieForm` | Ranking, catálogo com filtros, detalhes, cadastro, edição e remoção de filmes |
| `apps/mfe-avaliacoes` | 5175 | `MovieReviews`, `RecentReviews` | Avaliações de um filme (criar, editar, remover) e últimas avaliações do clube |

## Arquitetura

```
Navegador
└── shell (host)
    ├── remote catalogo   ← /mfe-catalogo/remoteEntry.js
    └── remote avaliacoes ← /mfe-avaliacoes/remoteEntry.js
            │
            ▼  HTTPS + Ocp-Apim-Subscription-Key
     Azure API Management ──▶ BFF
```

- **Module Federation** com `@module-federation/vite`; `react` e `react-dom` compartilhados como singleton.
- **Comunicação entre MFEs** por eventos do navegador: o MFE Avaliações emite `moviehub:reviews-changed` e o MFE Catálogo recarrega o score na hora; o Catálogo emite `moviehub:movies-changed` ao cadastrar ou remover filmes.
- **Falha isolada:** cada remote fica dentro de um Error Boundary no shell; se um deles sair do ar, só a sua área mostra o aviso.
- **Mostrar microfrontends:** a opção no cabeçalho contorna cada área com o nome do MFE que a renderiza.
- **Deploy:** um único site estático no Azure Storage (contêiner `$web`) com o shell na raiz e os remotes em `/mfe-catalogo/` e `/mfe-avaliacoes/`. O documento de erro do site é o `index.html`, para as rotas do React funcionarem ao recarregar a página. Os endereços dos remotes também podem ser configurados para publicação separada (`VITE_REMOTE_CATALOGO_URL`, `VITE_REMOTE_AVALIACOES_URL`).

## Tecnologias

React 19, Vite 8, @module-federation/vite, React Router 7, Azure Storage (site estático), GitHub Actions.

## Como executar

Com o BFF rodando em http://localhost:3000:

```bash
npm install
npm run dev        # sobe os três apps; abra http://localhost:5173
```

Cada MFE também roda sozinho (`npm run dev -w apps/mfe-catalogo`, porta 5174), útil para desenvolver sem o shell.

| Variável (`.env` na raiz) | Descrição |
|---|---|
| `VITE_BFF_URL` | URL do BFF pelo API Management (ex.: `https://<apim>.azure-api.net/moviehub`) |
| `VITE_APIM_SUBSCRIPTION_KEY` | Chave de assinatura do API Management |

### Testes

```bash
npm test           # isolamento entre MFEs, exposições do Module Federation, uso exclusivo do BFF e contrato de eventos
```

### Build e publicação

```bash
npm run build      # gera dist/ com o shell e os dois remotes
npm run preview    # serve o dist/ em http://localhost:4173 como o site estático
```

O workflow `.github/workflows/azure-storage-static-website.yml` publica no contêiner `$web` do Storage a cada push na `main` (variável `VITE_BFF_URL` e secrets `VITE_APIM_SUBSCRIPTION_KEY` e `AZURE_STORAGE_CONNECTION_STRING` no repositório). Sem o secret do Storage, o workflow só roda os testes.

## Repositórios do MovieHub

| Repositório | Papel |
|---|---|
| `moviehub-frontend` | Microfrontend React (shell + MFE Catálogo + MFE Avaliações) |
| `moviehub-bff` | BFF em Node/Express, único ponto de entrada do frontend (atrás do API Management) |
| `moviehub-ms-filmes` | Microsserviço de filmes — MongoDB Atlas |
| `moviehub-ms-avaliacoes` | Microsserviço de avaliações — Azure SQL, publica eventos na fila |
| `moviehub-function` | Azure Function — gatilho HTTP (insights) e gatilho de fila (eventos de avaliação) |

## Grupo

PJBL de Arquitetura e Soluções Cloud — PUCPR, prof. Manoel Valerio da Silveira Neto.

- Brayan Calisto dos Santos
- Caio Gabriel Silva
- Juliana Flores de Lima
- Leandro de Freitas Pires
