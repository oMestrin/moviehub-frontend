import { useCallback, useEffect, useId, useState } from "react";
import { createReview, deleteReview, listReviews, updateReview } from "./api/bff.js";
import { emitReviewsChanged } from "./events.js";
import { formatDate, rememberAuthor, rememberedAuthor } from "./format.js";
import RatingPicker from "./RatingPicker.jsx";
import "./avaliacoes.css";

/** Avaliações de um filme: lista, nova avaliação, edição e remoção. */
export default function MovieReviews({ movieId }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    listReviews(movieId)
      .then((data) => {
        setReviews(data);
        setStatus("ready");
      })
      .catch((e) => {
        setError(e.message);
        setStatus("error");
      });
  }, [movieId]);

  useEffect(() => {
    setStatus("loading");
    load();
  }, [load]);

  const changed = (action) => {
    emitReviewsChanged({ movieId, action });
    load();
  };

  return (
    <section className="rev-panel" aria-labelledby="rev-panel-title">
      <h2 id="rev-panel-title" className="rev-panel__title">Avaliações dos membros</h2>
      <NewReview movieId={movieId} onCreated={() => changed("created")} />

      {status === "loading" && <p className="rev-notice">Carregando avaliações…</p>}
      {status === "error" && <p className="rev-notice rev-notice--error">Não foi possível carregar as avaliações. {error}</p>}
      {status === "ready" && reviews.length === 0 && <p className="rev-notice">Ninguém avaliou este filme ainda. Seja a primeira pessoa.</p>}

      <ul className="rev-list">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} onChanged={changed} />
        ))}
      </ul>
    </section>
  );
}

function NewReview({ movieId, onCreated }) {
  const id = useId();
  const [author, setAuthor] = useState(rememberedAuthor);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (rating === null) {
      setError("Escolha uma nota de 0 a 10.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createReview({ movieId, author: author.trim(), rating, comment: comment.trim() || null });
      rememberAuthor(author.trim());
      setRating(null);
      setComment("");
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rev-form" onSubmit={handleSubmit}>
      <label className="rev-field">
        Seu nome
        <input required maxLength={80} value={author} onChange={(e) => setAuthor(e.target.value)} />
      </label>
      <RatingPicker name={`${id}-rating`} value={rating} onChange={setRating} />
      <label className="rev-field">
        Comentário (opcional)
        <textarea maxLength={1000} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
      {error && <p className="rev-notice rev-notice--error" role="alert">{error}</p>}
      <button type="submit" className="rev-button" disabled={saving}>
        {saving ? "Publicando…" : "Publicar avaliação"}
      </button>
    </form>
  );
}

function ReviewItem({ review, onChanged }) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [error, setError] = useState(null);

  async function save(event) {
    event.preventDefault();
    setError(null);
    try {
      await updateReview(review.id, { rating, comment: comment.trim() || null });
      setEditing(false);
      onChanged("updated");
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove() {
    setError(null);
    try {
      await deleteReview(review.id);
      onChanged("deleted");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <li className="rev-item">
      <div className="rev-item__score" aria-label={`Nota ${review.rating} de 10`}>
        {review.rating}
      </div>
      <div className="rev-item__body">
        <p className="rev-item__who">
          <strong>{review.author}</strong> <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
        </p>
        {editing ? (
          <form onSubmit={save} className="rev-edit">
            <RatingPicker name={`${id}-edit`} value={rating} onChange={setRating} />
            <label className="rev-field">
              Comentário
              <textarea maxLength={1000} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>
            <div className="rev-item__actions">
              <button type="submit" className="rev-button">Salvar avaliação</button>
              <button type="button" className="rev-link" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            {review.comment && <p className="rev-item__comment">{review.comment}</p>}
            <div className="rev-item__actions">
              <button type="button" className="rev-link" onClick={() => setEditing(true)}>Editar</button>
              <button type="button" className="rev-link" onClick={remove}>Remover</button>
            </div>
          </>
        )}
        {error && <p className="rev-notice rev-notice--error" role="alert">{error}</p>}
      </div>
    </li>
  );
}
