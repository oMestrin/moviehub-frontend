import { Component, Suspense } from "react";

/**
 * Área da página ocupada por um microfrontend.
 * Se o remote não carregar (fora do ar, deploy quebrado), só esta área mostra
 * o aviso; o resto da aplicação continua funcionando.
 */
export default function RemoteSlot({ remote, label, children }) {
  return (
    <div className="shell-slot" data-mfe={remote} data-mfe-label={label}>
      <RemoteBoundary label={label}>
        <Suspense fallback={<p className="shell-muted">Carregando {label.toLowerCase()}…</p>}>{children}</Suspense>
      </RemoteBoundary>
    </div>
  );
}

class RemoteBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(`[shell] falha no microfrontend ${this.props.label}:`, error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="shell-fallback" role="status">
          <p>{this.props.label} está indisponível agora.</p>
          <button type="button" onClick={() => window.location.reload()}>Recarregar a página</button>
        </div>
      );
    }
    return this.props.children;
  }
}
