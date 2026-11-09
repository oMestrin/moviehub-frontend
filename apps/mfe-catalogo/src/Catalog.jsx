import { useMemo, useState } from "react";
import { formatScore } from "./format.js";
import Poster from "./Poster.jsx";
import { useAggregatedData } from "./store.js";
import "./catalogo.css";

/** Grade do catálogo, com filtro por gênero e busca por título. */
export default function Catalog({ onOpenMovie = () => {} }) {
  const { status, data, error } = useAggregatedData();
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");

  const movies = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return (data?.movies ?? [])
      .filter((m) => !genre || m.genre === genre)
      .filter((m) => !term || m.title.toLocaleLowerCase("pt-BR").includes(term))
      .sort((a, b) => (b.insight?.score ?? b.rating) - (a.insight?.score ?? a.rating) || a.title.localeCompare(b.title, "pt-BR"));
  }, [data, genre, search]);

  if (status === "loading" || status === "idle") return <p className="cat-notice">Carregando filmes…</p>;
  if (status === "error" && !data) return <p className="cat-notice cat-notice--error">Não foi possível carregar os filmes. {error}</p>;

  const genres = [...new Set(data.movies.map((m) => m.genre))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <section className="cat-catalog" aria-labelledby="cat-catalog-title">
      <div className="cat-catalog__head">
        <h2 id="cat-catalog-title">Catálogo</h2>
        <label className="cat-search">
          <span className="cat-visually-hidden">Buscar por título</span>
          <input type="search" placeholder="Buscar por título" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div className="cat-genres" role="group" aria-label="Filtrar por gênero">
        <button type="button" aria-pressed={genre === ""} onClick={() => setGenre("")}>Todos</button>
        {genres.map((g) => (
          <button type="button" key={g} aria-pressed={genre === g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      {movies.length === 0 ? (
        <p className="cat-notice">Nenhum filme encontrado com esse filtro.</p>
      ) : (
        <ul className="cat-grid">
          {movies.map((movie) => (
            <li key={movie.id}>
              <button type="button" className="cat-card" onClick={() => onOpenMovie(movie.id)}>
                <Poster movie={movie} />
                <span className="cat-card__title">{movie.title}</span>
                <span className="cat-card__meta">
                  {movie.releaseYear}, {movie.genre}
                </span>
                {movie.insight ? (
                  <span className="cat-card__score" title="Score: nota da crítica combinada com a dos membros">
                    {formatScore(movie.insight.score)} <small>{movie.insight.label}</small>
                  </span>
                ) : (
                  <span className="cat-card__score">{formatScore(movie.rating)} <small>crítica</small></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
