// Contrato de comunicação entre microfrontends: eventos do navegador (CustomEvent em window).
export const REVIEWS_CHANGED = "moviehub:reviews-changed"; // emitido pelo MFE Avaliações
export const MOVIES_CHANGED = "moviehub:movies-changed"; // emitido por este MFE

export const emitMoviesChanged = (detail) => window.dispatchEvent(new CustomEvent(MOVIES_CHANGED, { detail }));
