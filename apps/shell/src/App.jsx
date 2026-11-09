import { lazy, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import RemoteSlot from "./RemoteSlot.jsx";

// Componentes carregados em tempo de execução dos remotes (Module Federation)
const Highlights = lazy(() => import("catalogo/Highlights"));
const Catalog = lazy(() => import("catalogo/Catalog"));
const MovieDetails = lazy(() => import("catalogo/MovieDetails"));
const MovieForm = lazy(() => import("catalogo/MovieForm"));
const MovieReviews = lazy(() => import("avaliacoes/MovieReviews"));
const RecentReviews = lazy(() => import("avaliacoes/RecentReviews"));

const CATALOGO = "MFE Catálogo";
const AVALIACOES = "MFE Avaliações";

export default function App() {
  const [showModules, setShowModules] = useState(false);

  return (
    <div className={showModules ? "shell shell--show-modules" : "shell"}>
      <header className="shell-header">
        <Link to="/" className="shell-logo">MovieHub</Link>
        <nav className="shell-nav" aria-label="Principal">
          <NavLink to="/" end>Catálogo</NavLink>
          <NavLink to="/filmes/novo">Cadastrar filme</NavLink>
        </nav>
        <label className="shell-toggle">
          <input type="checkbox" checked={showModules} onChange={(e) => setShowModules(e.target.checked)} />
          Mostrar microfrontends
        </label>
      </header>

      <main className="shell-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/filmes/novo" element={<NewMoviePage />} />
          <Route path="/filmes/:id" element={<MoviePage />} />
          <Route path="/filmes/:id/editar" element={<EditMoviePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="shell-footer">
        <p>MovieHub, PJBL de Arquitetura e Soluções Cloud, PUCPR.</p>
        <p>Brayan Calisto dos Santos, Caio Gabriel Silva, Juliana Flores de Lima e Leandro de Freitas Pires.</p>
      </footer>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const open = (id) => navigate(`/filmes/${id}`);
  return (
    <>
      <RemoteSlot remote="catalogo" label={CATALOGO}>
        <Highlights onOpenMovie={open} />
      </RemoteSlot>
      <div className="shell-columns">
        <RemoteSlot remote="catalogo" label={CATALOGO}>
          <Catalog onOpenMovie={open} />
        </RemoteSlot>
        <aside>
          <RemoteSlot remote="avaliacoes" label={AVALIACOES}>
            <RecentReviews onOpenMovie={open} />
          </RemoteSlot>
        </aside>
      </div>
    </>
  );
}

function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <Link to="/" className="shell-back">Voltar ao catálogo</Link>
      <RemoteSlot remote="catalogo" label={CATALOGO}>
        <MovieDetails movieId={id} onEdit={() => navigate(`/filmes/${id}/editar`)} onDeleted={() => navigate("/")} onBack={() => navigate("/")} />
      </RemoteSlot>
      <div className="shell-reviews">
        <RemoteSlot remote="avaliacoes" label={AVALIACOES}>
          <MovieReviews movieId={id} />
        </RemoteSlot>
      </div>
    </>
  );
}

function NewMoviePage() {
  const navigate = useNavigate();
  return (
    <RemoteSlot remote="catalogo" label={CATALOGO}>
      <MovieForm onSaved={(movie) => navigate(`/filmes/${movie.id}`)} onCancel={() => navigate("/")} />
    </RemoteSlot>
  );
}

function EditMoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <RemoteSlot remote="catalogo" label={CATALOGO}>
      <MovieForm movieId={id} onSaved={() => navigate(`/filmes/${id}`)} onCancel={() => navigate(`/filmes/${id}`)} />
    </RemoteSlot>
  );
}

function NotFound() {
  return (
    <div className="shell-notfound">
      <h1>Página não encontrada</h1>
      <p>O endereço não existe no MovieHub.</p>
      <Link to="/">Ir para o catálogo</Link>
    </div>
  );
}
