// Execução isolada do MFE Catálogo (npm run dev dentro de apps/mfe-catalogo), sem o shell.
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import Catalog from "./Catalog.jsx";
import Highlights from "./Highlights.jsx";
import MovieDetails from "./MovieDetails.jsx";

function Standalone() {
  const [movieId, setMovieId] = useState(null);
  return movieId ? (
    <MovieDetails movieId={movieId} onBack={() => setMovieId(null)} onDeleted={() => setMovieId(null)} />
  ) : (
    <>
      <Highlights onOpenMovie={setMovieId} />
      <Catalog onOpenMovie={setMovieId} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Standalone />
  </StrictMode>
);
