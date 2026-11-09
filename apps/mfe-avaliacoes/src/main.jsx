// Execução isolada do MFE Avaliações (npm run dev dentro de apps/mfe-avaliacoes), sem o shell.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MovieReviews from "./MovieReviews.jsx";
import RecentReviews from "./RecentReviews.jsx";

const movieId = new URLSearchParams(location.search).get("movieId") ?? "4f3c2a1e-0001-4b8e-9f00-000000000001";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
      <MovieReviews movieId={movieId} />
      <RecentReviews />
    </div>
  </StrictMode>
);
