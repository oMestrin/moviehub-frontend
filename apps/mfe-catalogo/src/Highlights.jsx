import { formatScore, formatVotes } from "./format.js";
import Poster from "./Poster.jsx";
import { useAggregatedData } from "./store.js";
import "./catalogo.css";

/** Destaque da página inicial: os três filmes com maior score e o resumo do catálogo. */
export default function Highlights({ onOpenMovie = () => {} }) {
  const { status, data, error } = useAggregatedData();

  if (status === "loading" || status === "idle") return <div className="cat-hero cat-hero--loading" aria-busy="true" />;
  if (status === "error" && !data) return <p className="cat-notice cat-notice--error">Não foi possível carregar o catálogo. {error}</p>;

  const { topRated, summary, movies, sources } = data;
  const byId = new Map(movies.map((m) => [m.id, m]));
  const podium = topRated.map((t) => ({ ...t, movie: byId.get(t.movieId) })).filter((t) => t.movie);

  return (
    <section className="cat-hero" aria-labelledby="cat-hero-title">
      <h2 id="cat-hero-title" className="cat-hero__title">Mais bem avaliados pelo clube</h2>

      {sources.insights !== "ok" ? (
        <p className="cat-notice">O ranking está indisponível agora. Os filmes continuam no catálogo logo abaixo.</p>
      ) : (
        <ol className="cat-podium">
          {podium.map(({ movie, score, label }, index) => (
            <li key={movie.id} className={`cat-podium__item cat-podium__item--${index + 1}`}>
              <button type="button" className="cat-podium__link" onClick={() => onOpenMovie(movie.id)}>
                <Poster movie={movie} size={index === 0 ? "lg" : "sm"} />
                <span className="cat-podium__rank" aria-label={`${index + 1}º lugar`}>{index + 1}</span>
                <span className="cat-podium__text">
                  <span className="cat-podium__name">{movie.title}</span>
                  <span className="cat-podium__score">{formatScore(score)}</span>
                  <span className="cat-podium__label">
                    {label}, {formatVotes(movie.membersRating?.count)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <p className="cat-summary">
        {summary.totalMovies} filmes no catálogo e {summary.totalReviews} avaliações dos membros.
        {summary.averageCriticsRating !== null && (
          <>
            {" "}Média da crítica <strong>{formatScore(summary.averageCriticsRating)}</strong>, dos membros{" "}
            <strong>{formatScore(summary.averageMembersRating)}</strong>.
          </>
        )}
      </p>
    </section>
  );
}
