import { useState } from "react";
import { deleteMovie } from "./api/bff.js";
import { emitMoviesChanged } from "./events.js";
import { formatScore, formatVotes } from "./format.js";
import Poster from "./Poster.jsx";
import { useAggregatedData } from "./store.js";
import "./catalogo.css";

/** Detalhes de um filme: dados do catálogo + score calculado pela Function. */
export default function MovieDetails({ movieId, onEdit = () => {}, onDeleted = () => {}, onBack = () => {} }) {
  const { status, data, error } = useAggregatedData();
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  if (status === "loading" || status === "idle") return <p className="cat-notice">Carregando filme…</p>;
  if (status === "error" && !data) return <p className="cat-notice cat-notice--error">Não foi possível carregar o filme. {error}</p>;

  const movie = data.movies.find((m) => m.id === movieId);
  if (!movie) {
    return (
      <div className="cat-details">
        <p className="cat-notice">Este filme não está no catálogo. Ele pode ter sido removido.</p>
        <button type="button" className="cat-button" onClick={onBack}>Voltar ao catálogo</button>
      </div>
    );
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteMovie(movie.id);
      emitMoviesChanged({ movieId: movie.id, action: "deleted" });
      onDeleted(movie.id);
    } catch (e) {
      setDeleteError(e.message);
    }
  }

  return (
    <article className="cat-details" aria-labelledby="cat-details-title">
      <div className="cat-details__poster">
        <Poster movie={movie} size="lg" decorative={false} />
      </div>
      <div className="cat-details__body">
        <h2 id="cat-details-title" className="cat-details__title">{movie.title}</h2>
        <p className="cat-details__meta">
          {movie.releaseYear}, {movie.genre}. Direção de {movie.director}.
        </p>

        <dl className="cat-scores">
          <div className="cat-scores__main">
            <dt>Score do clube</dt>
            <dd>
              {movie.insight ? formatScore(movie.insight.score) : "–"}
              {movie.insight && <span>{movie.insight.label}</span>}
            </dd>
          </div>
          <div>
            <dt>Crítica</dt>
            <dd>{formatScore(movie.rating)}</dd>
          </div>
          <div>
            <dt>Membros</dt>
            <dd>
              {formatScore(movie.membersRating?.average)}
              <span>{formatVotes(movie.membersRating?.count)}</span>
            </dd>
          </div>
        </dl>

        <p className="cat-details__synopsis">{movie.synopsis}</p>

        <div className="cat-actions">
          <button type="button" className="cat-button" onClick={() => onEdit(movie.id)}>Editar filme</button>
          {confirming ? (
            <>
              <button type="button" className="cat-button cat-button--danger" onClick={handleDelete}>Confirmar remoção</button>
              <button type="button" className="cat-button cat-button--quiet" onClick={() => setConfirming(false)}>Cancelar</button>
            </>
          ) : (
            <button type="button" className="cat-button cat-button--quiet" onClick={() => setConfirming(true)}>Remover filme</button>
          )}
        </div>
        {deleteError && <p className="cat-notice cat-notice--error" role="alert">{deleteError}</p>}
      </div>
    </article>
  );
}
