import { useEffect, useState } from "react";
import { getAggregatedData } from "./api/bff.js";
import { MOVIES_CHANGED, REVIEWS_CHANGED } from "./events.js";
import { formatDate } from "./format.js";
import "./avaliacoes.css";

/** Últimas avaliações publicadas no clube (vêm do /aggregated-data do BFF). */
export default function RecentReviews({ onOpenMovie = () => {} }) {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = () =>
      getAggregatedData()
        .then((data) => {
          setReviews(data.recentReviews);
          setError(data.sources.reviews === "ok" ? null : "As avaliações estão indisponíveis agora.");
        })
        .catch((e) => setError(e.message));
    load();
    window.addEventListener(REVIEWS_CHANGED, load);
    window.addEventListener(MOVIES_CHANGED, load);
    return () => {
      window.removeEventListener(REVIEWS_CHANGED, load);
      window.removeEventListener(MOVIES_CHANGED, load);
    };
  }, []);

  return (
    <section className="rev-recent" aria-labelledby="rev-recent-title">
      <h2 id="rev-recent-title" className="rev-recent__title">Últimas avaliações</h2>
      {error && <p className="rev-notice">{error}</p>}
      {reviews === null && !error && <p className="rev-notice">Carregando…</p>}
      {reviews?.length === 0 && <p className="rev-notice">Nenhuma avaliação publicada ainda.</p>}
      <ol className="rev-recent__list">
        {reviews?.map((review) => (
          <li key={review.id}>
            <button type="button" className="rev-recent__item" onClick={() => onOpenMovie(review.movieId)}>
              <span className="rev-recent__score">{review.rating}</span>
              <span>
                <span className="rev-recent__movie">{review.movieTitle ?? "Filme removido"}</span>
                <span className="rev-recent__who">
                  {review.author}, {formatDate(review.createdAt)}
                </span>
                {review.comment && <span className="rev-recent__comment">{review.comment}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
