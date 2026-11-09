import { useState } from "react";

// cor do cartaz pelo gênero, para filmes do mesmo gênero ficarem parecidos
const COLORS = ["#2f4b8f", "#7a2944", "#9a4a1f", "#1f6b62", "#5b3a8c", "#6b6b1f", "#2d5f86", "#8c3a6e"];

function colorOf(genre) {
  let hash = 0;
  for (const char of genre) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

/**
 * Cartaz do filme. Usa a imagem de posterUrl quando houver; senão (ou se a
 * imagem não carregar) desenha um cartaz tipográfico com título, ano e direção.
 */
export default function Poster({ movie, size = "md", decorative = true }) {
  const [failed, setFailed] = useState(false);
  const alt = decorative ? "" : `Cartaz de ${movie.title}`;
  // o título encolhe para a palavra mais longa caber na largura do cartaz
  const longestWord = Math.max(...movie.title.split(/\s+/).map((word) => word.length));
  const titleSize = `${Math.min(16, 140 / longestWord).toFixed(1)}cqi`;

  if (movie.posterUrl && !failed) {
    return <img className={`cat-poster cat-poster--${size}`} src={movie.posterUrl} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
  }

  return (
    <div className={`cat-poster cat-poster--${size} cat-poster--type`} style={{ "--poster": colorOf(movie.genre), "--title-size": titleSize }} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : alt} aria-hidden={decorative || undefined}>
      <span className="cat-poster__art">
        <span className="cat-poster__year">{movie.releaseYear}</span>
        <span className="cat-poster__title">{movie.title}</span>
        <span className="cat-poster__director">{movie.director}</span>
      </span>
    </div>
  );
}
