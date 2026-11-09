import { useEffect, useState } from "react";
import { createMovie, getMovie, updateMovie } from "./api/bff.js";
import { emitMoviesChanged } from "./events.js";
import { useAggregatedData } from "./store.js";
import "./catalogo.css";

const EMPTY = { title: "", releaseYear: "", genre: "", director: "", rating: "", synopsis: "", posterUrl: "" };

/** Cadastro e edição de filme. Sem movieId, cadastra; com movieId, edita. */
export default function MovieForm({ movieId, onSaved = () => {}, onCancel = () => {} }) {
  const { data } = useAggregatedData();
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(Boolean(movieId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const editing = Boolean(movieId);

  useEffect(() => {
    if (!movieId) return;
    getMovie(movieId)
      .then((movie) => setValues(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, movie[k] ?? ""]))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [movieId]);

  const set = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const input = { ...values, releaseYear: Number(values.releaseYear), rating: Number(values.rating), posterUrl: values.posterUrl.trim() || null };
    try {
      const saved = editing ? await updateMovie(movieId, input) : await createMovie(input);
      emitMoviesChanged({ movieId: saved.id, action: editing ? "updated" : "created" });
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="cat-notice">Carregando filme…</p>;

  const genres = [...new Set((data?.movies ?? []).map((m) => m.genre))];

  return (
    <form className="cat-form" onSubmit={handleSubmit}>
      <h2>{editing ? "Editar filme" : "Cadastrar filme"}</h2>

      <label className="cat-field cat-field--wide">
        Título
        <input required maxLength={200} value={values.title} onChange={set("title")} />
      </label>
      <label className="cat-field">
        Ano de lançamento
        <input required type="number" min="1888" max="2100" value={values.releaseYear} onChange={set("releaseYear")} />
      </label>
      <label className="cat-field">
        Gênero
        <input required maxLength={60} list="cat-genres" value={values.genre} onChange={set("genre")} />
        <datalist id="cat-genres">
          {genres.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>
      <label className="cat-field">
        Direção
        <input required maxLength={120} value={values.director} onChange={set("director")} />
      </label>
      <label className="cat-field">
        Nota da crítica (0 a 10)
        <input required type="number" min="0" max="10" step="0.1" value={values.rating} onChange={set("rating")} />
      </label>
      <label className="cat-field cat-field--wide">
        Sinopse
        <textarea required maxLength={2000} rows={4} value={values.synopsis} onChange={set("synopsis")} />
      </label>
      <label className="cat-field cat-field--wide">
        Endereço do pôster (opcional)
        <input type="url" placeholder="https://" value={values.posterUrl} onChange={set("posterUrl")} />
      </label>

      {error && <p className="cat-notice cat-notice--error cat-field--wide" role="alert">{error}</p>}

      <div className="cat-actions cat-field--wide">
        <button type="submit" className="cat-button" disabled={saving}>
          {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar filme"}
        </button>
        <button type="button" className="cat-button cat-button--quiet" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
